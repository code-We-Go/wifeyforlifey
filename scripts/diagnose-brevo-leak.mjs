import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load .env.local manually
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
if (!mongoUri) {
  console.error("No MongoDB URI found in .env.local");
  process.exit(1);
}

const GEHAZ_FULL = "687396821b4da119eb1c13fe";
const GEHAZ_MINI = "68bf6ae9c4d5c1af12cdcd37";
const WEDDING_FULL = "6965e63c6df4503dda02c12b";
const WEDDING_MINI = "6a2d9aec3def6ce76dc7babc";

async function run() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const col = db.collection("subscriptions");

  const allSubs = await col.find({ subscribed: true }).toArray();
  console.log(`Total subscribed documents found in DB: ${allSubs.length}`);

  const packages = {
    "Gehaz Full (List 5)": { id: GEHAZ_FULL, expectedList: 5, docs: [] },
    "Gehaz Mini (List 4)": { id: GEHAZ_MINI, expectedList: 4, docs: [] },
    "Wedding Full (List 16)": { id: WEDDING_FULL, expectedList: 16, docs: [] },
    "Wedding Mini (List 17)": { id: WEDDING_MINI, expectedList: 17, docs: [] },
    "Other/Unknown": { id: "other", expectedList: null, docs: [] },
  };

  for (const sub of allSubs) {
    const pkgId = sub.packageID?.toString();
    if (pkgId === GEHAZ_FULL) {
      packages["Gehaz Full (List 5)"].docs.push(sub);
    } else if (pkgId === GEHAZ_MINI) {
      packages["Gehaz Mini (List 4)"].docs.push(sub);
    } else if (pkgId === WEDDING_FULL) {
      packages["Wedding Full (List 16)"].docs.push(sub);
    } else if (pkgId === WEDDING_MINI) {
      packages["Wedding Mini (List 17)"].docs.push(sub);
    } else {
      packages["Other/Unknown"].docs.push(sub);
    }
  }

  for (const [name, data] of Object.entries(packages)) {
    const totalDocs = data.docs.length;
    if (totalDocs === 0) continue;

    const emails = data.docs
      .map((d) => (d.email || d.giftRecipientEmail || "").trim().toLowerCase())
      .filter(Boolean);
    const uniqueEmails = new Set(emails);
    const giftCount = data.docs.filter((d) => d.isGift).length;
    const duplicateCount = totalDocs - uniqueEmails.size;

    console.log(`\n--- ${name} ---`);
    console.log(`  Total DB documents: ${totalDocs}`);
    console.log(`  Unique Emails:      ${uniqueEmails.size}`);
    console.log(`  Gift Subscriptions: ${giftCount}`);
    console.log(`  Duplicate Emails:   ${duplicateCount}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
