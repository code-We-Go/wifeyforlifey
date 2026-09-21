import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// 1. Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
        process.env[key] = value;
      }
    }
  }
}

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
const brevoApiKey = process.env.BREVO_API_KEY;

if (!mongoUri) {
  console.error("❌ No MONGODB_URI found in .env.local");
  process.exit(1);
}

if (!brevoApiKey) {
  console.error("❌ No BREVO_API_KEY found in .env.local");
  process.exit(1);
}

const PACKAGE_CONFIG = {
  "687396821b4da119eb1c13fe": { name: "Gehaz Full Experience", listId: 5 },
  "68bf6ae9c4d5c1af12cdcd37": { name: "Gehaz Mini Experience", listId: 4 },
  "6965e63c6df4503dda02c12b": { name: "Wedding Full Experience", listId: 16 },
  "6a2d9aec3def6ce76dc7babc": { name: "Wedding Mini Experience", listId: 17 },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to fetch all contact emails currently in a Brevo list
async function getBrevoListContacts(listId) {
  const emails = new Set();
  let offset = 0;
  const limit = 50;

  try {
    while (true) {
      const res = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Accept: "application/json",
            "api-key": brevoApiKey,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 404) break;
        const errText = await res.text();
        console.warn(`⚠️ Brevo GET list ${listId} returned ${res.status}: ${errText}`);
        break;
      }

      const data = await res.json();
      const contacts = data.contacts || [];
      if (contacts.length === 0) break;

      for (const c of contacts) {
        if (c.email) emails.add(c.email.trim().toLowerCase());
      }

      offset += limit;
      if (offset >= (data.count || 0)) break;
    }
    return emails;
  } catch (err) {
    console.warn(`⚠️ Error querying Brevo for list ${listId}:`, err.message);
    return null;
  }
}

// Function to sync single contact to Brevo with fallback
async function syncContactToBrevo(contact, listId) {
  const cleanEmail = (contact.email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, reason: "Invalid email" };
  }

  const attributes = {};
  if (contact.firstName && contact.firstName.trim()) {
    attributes.FIRSTNAME = contact.firstName.trim();
  }
  if (contact.lastName && contact.lastName.trim()) {
    attributes.LASTNAME = contact.lastName.trim();
  }

  if (contact.phone && !contact.phone.includes("@")) {
    const digits = contact.phone.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) {
      if (contact.phone.startsWith("+")) {
        attributes.SMS = `+${digits}`;
      } else if (digits.startsWith("20") && digits.length === 12) {
        attributes.SMS = `+${digits}`;
      } else if (digits.startsWith("0")) {
        attributes.SMS = `+20${digits.slice(1)}`;
      } else {
        attributes.SMS = `+20${digits}`;
      }
    }
  }

  const payload = {
    email: cleanEmail,
    listIds: [listId],
    updateEnabled: true,
  };
  if (Object.keys(attributes).length > 0) {
    payload.attributes = attributes;
  }

  try {
    let res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(payload),
    });

    // Fallback if rejected due to attribute/SMS format error
    if (!res.ok && payload.attributes) {
      res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          email: cleanEmail,
          listIds: [listId],
          updateEnabled: true,
        }),
      });
    }

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, reason: `${res.status}: ${errBody}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

async function runLiveReconciliation() {
  console.log("==================================================");
  console.log("       LIVE BREVO RECONCILIATION EXECUTION        ");
  console.log("==================================================\n");

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const col = db.collection("subscriptions");

  const subscriptions = await col.find({ subscribed: true }).toArray();
  console.log(`📦 Total active/confirmed subscriptions in MongoDB: ${subscriptions.length}\n`);

  const groups = {
    5: { ...PACKAGE_CONFIG["687396821b4da119eb1c13fe"], contacts: new Map() },
    4: { ...PACKAGE_CONFIG["68bf6ae9c4d5c1af12cdcd37"], contacts: new Map() },
    16: { ...PACKAGE_CONFIG["6965e63c6df4503dda02c12b"], contacts: new Map() },
    17: { ...PACKAGE_CONFIG["6a2d9aec3def6ce76dc7babc"], contacts: new Map() },
  };

  for (const sub of subscriptions) {
    const pkgId = sub.packageID?.toString();
    const config = PACKAGE_CONFIG[pkgId];
    if (!config) continue;

    const email = (
      (sub.isGift && sub.giftRecipientEmail ? sub.giftRecipientEmail : sub.email) ||
      sub.giftSenderEmail ||
      ""
    ).trim().toLowerCase();

    if (!email || !email.includes("@")) continue;

    const firstName = sub.firstName || sub.billingFirstName || "";
    const lastName = sub.lastName || sub.billingLastName || "";
    const phone = sub.phone || sub.billingPhone || sub.whatsAppNumber || "";

    const group = groups[config.listId];
    if (!group.contacts.has(email) || (phone && !group.contacts.get(email).phone)) {
      group.contacts.set(email, {
        email,
        firstName,
        lastName,
        phone,
        isGift: !!sub.isGift,
        subId: sub._id.toString(),
      });
    }
  }

  let totalSynced = 0;
  let totalFailed = 0;

  for (const listId of [5, 4, 16, 17]) {
    const group = groups[listId];
    console.log(`--------------------------------------------------`);
    console.log(`📌 Processing: ${group.name} (Brevo List ${listId})`);
    console.log(`--------------------------------------------------`);

    const brevoEmails = await getBrevoListContacts(listId);
    if (!brevoEmails) {
      console.error(`❌ Could not fetch Brevo contacts for list ${listId}, skipping.`);
      continue;
    }

    const missingInBrevo = [];
    for (const [email, info] of group.contacts.entries()) {
      if (!brevoEmails.has(email)) {
        missingInBrevo.push(info);
      }
    }

    console.log(`Found ${missingInBrevo.length} missing contacts in List ${listId}. Syncing now...`);

    let listSuccess = 0;
    let listFail = 0;

    for (let i = 0; i < missingInBrevo.length; i++) {
      const contact = missingInBrevo[i];
      const res = await syncContactToBrevo(contact, listId);

      if (res.success) {
        listSuccess++;
        totalSynced++;
        process.stdout.write(`  ✅ [${i + 1}/${missingInBrevo.length}] Synced ${contact.email}\n`);
      } else {
        listFail++;
        totalFailed++;
        process.stdout.write(`  ❌ [${i + 1}/${missingInBrevo.length}] Failed ${contact.email}: ${res.reason}\n`);
      }

      // Small throttle to be courteous to Brevo API rate limits
      await sleep(150);
    }

    console.log(`\nFinished List ${listId}: ${listSuccess} succeeded, ${listFail} failed.\n`);
  }

  await mongoose.disconnect();
  console.log("==================================================");
  console.log(`RECONCILIATION COMPLETE!`);
  console.log(`Total Successfully Synced: ${totalSynced}`);
  console.log(`Total Failed:              ${totalFailed}`);
  console.log("==================================================");
}

runLiveReconciliation().catch(console.error);
