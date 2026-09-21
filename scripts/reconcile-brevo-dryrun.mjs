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

const PACKAGE_CONFIG = {
  "687396821b4da119eb1c13fe": { name: "Gehaz Full Experience", listId: 5 },
  "68bf6ae9c4d5c1af12cdcd37": { name: "Gehaz Mini Experience", listId: 4 },
  "6965e63c6df4503dda02c12b": { name: "Wedding Full Experience", listId: 16 },
  "6a2d9aec3def6ce76dc7babc": { name: "Wedding Mini Experience", listId: 17 },
};

// Helper to fetch all contact emails currently in a Brevo list
async function getBrevoListContacts(listId) {
  if (!brevoApiKey) {
    console.warn("⚠️ No BREVO_API_KEY set, cannot fetch remote list members.");
    return null;
  }
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
        if (res.status === 404) {
          // List might be empty or newly created
          break;
        }
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

async function runDryRun() {
  console.log("==================================================");
  console.log("       BREVO RECONCILIATION DRY-RUN REPORT        ");
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

    // Determine the right email address
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
    // Keep most complete record if duplicate exists
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

  // Summary per package
  for (const listId of [5, 4, 16, 17]) {
    const group = groups[listId];
    console.log(`--------------------------------------------------`);
    console.log(`📌 ${group.name} (Brevo Target List: ${listId})`);
    console.log(`--------------------------------------------------`);
    console.log(`  Total Unique Contacts in DB: ${group.contacts.size}`);

    const brevoEmails = await getBrevoListContacts(listId);
    if (brevoEmails !== null) {
      console.log(`  Current Contacts in Brevo:   ${brevoEmails.size}`);

      const missingInBrevo = [];
      for (const [email, info] of group.contacts.entries()) {
        if (!brevoEmails.has(email)) {
          missingInBrevo.push(info);
        }
      }

      console.log(`  🚨 MISSING in Brevo List ${listId}: ${missingInBrevo.length}`);

      if (missingInBrevo.length > 0) {
        console.log(`\n  Sample of missing contacts to be synced (up to 10):`);
        missingInBrevo.slice(0, 10).forEach((c, idx) => {
          console.log(
            `   ${idx + 1}. ${c.email} | Name: "${c.firstName} ${c.lastName}" | Phone: ${c.phone || "N/A"} | Gift: ${c.isGift}`
          );
        });
        if (missingInBrevo.length > 10) {
          console.log(`   ... and ${missingInBrevo.length - 10} more.`);
        }
      }
    } else {
      console.log(`  ℹ️ Unable to fetch current Brevo count (check API key/permissions).`);
      console.log(`  All ${group.contacts.size} unique contacts ready for sync.`);
    }
    console.log("");
  }

  await mongoose.disconnect();
  console.log("==================================================");
  console.log("               DRY RUN COMPLETED                  ");
  console.log("==================================================");
}

runDryRun().catch(console.error);
