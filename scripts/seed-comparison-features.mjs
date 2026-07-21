/**
 * Migration script: Update Gehaz Bestie & Wedding Experience packages
 *
 * - Sets slug on both package pairs
 * - Adds comparisonFeatures + hero/callout fields to the Full packages
 *
 * Run with: node scripts/seed-comparison-features.mjs
 */

import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb://wifeyforlifey:Wifey4Lifey%21@ac-kdiurps-shard-00-00.j0pm4vx.mongodb.net:27017,ac-kdiurps-shard-00-01.j0pm4vx.mongodb.net:27017,ac-kdiurps-shard-00-02.j0pm4vx.mongodb.net:27017/wifeyforlifey?ssl=true&replicaSet=atlas-hlglft-shard-0&authSource=admin&retryWrites=true&w=majority";

// ── Gehaz Bestie ──
const GEHAZ_FULL_ID = "687396821b4da119eb1c13fe";
const GEHAZ_MINI_ID = "68bf6ae9c4d5c1af12cdcd37";
const GEHAZ_SLUG = "GehazBestiePlanner";

// ── Wedding Experience ──
const WEDDING_FULL_ID = "6965e63c6df4503dda02c12b";
const WEDDING_MINI_ID = "6a2d9aec3def6ce76dc7babc";
const WEDDING_SLUG = "WeddingBestiePlanner";

const GEHAZ_COMPARISON = [
  { feature: "Your Gehaz Bestie Planner — physical book delivered", fullValue: "✓", miniValue: "✓" },
  { feature: "Bridal-era video guides for every purchase", fullValue: "12 playlists", miniValue: "1 playlist" },
  { feature: "Wifeys WhatsApp support circle — 24/7, brides only", fullValue: "✓", miniValue: "—" },
  { feature: "Exclusive community discounts from trusted partners", fullValue: "✓", miniValue: "—" },
  { feature: "10–20% off 1:1 expert consultations", fullValue: "✓", miniValue: "—" },
  { feature: "Virtual personal shopper — Wifey-approved products & fair prices", fullValue: "✓", miniValue: "—" },
];

const WEDDING_COMPARISON = [
  { feature: "Your Wedding Bestie Planner — physical book delivered", fullValue: "✓", miniValue: "✓" },
  { feature: "Bridal-era video guides for every purchase", fullValue: "12 playlists", miniValue: "1 playlist" },
  { feature: "Wifeys WhatsApp support circle — 24/7, brides only", fullValue: "✓", miniValue: "—" },
  { feature: "Exclusive community discounts from trusted partners", fullValue: "✓", miniValue: "—" },
  { feature: "10–20% off 1:1 expert consultations", fullValue: "✓", miniValue: "—" },
  { feature: "Virtual personal shopper — Wifey-approved products & fair prices", fullValue: "✓", miniValue: "—" },
];

const HERO_CALLOUT = {
  heroTitle: "Everything for your bridal era — in one place",
  heroSubtitle:
    "Planners, tools & real support built for Egyptian brides. Wherever you are in your journey, there's a bestie for it. 🎀",
  badgeLabel: "Wifey Experience",
  calloutBadge: "Why most brides choose Full 💕",
  calloutTitle: "Why most brides choose Full 💕",
  calloutDescription:
    "For LE 1,000 more, you unlock 11 extra playlists plus a full year of community, expert access and partner discounts. One appliance discount alone can cover the difference.",
};

async function main() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  const db = mongoose.connection.db;
  const col = db.collection("packages");

  // ════════════════ Gehaz Bestie ════════════════
  console.log("── Gehaz Bestie ──");

  // 1a. Slug on both
  const gehazSlugRes = await col.updateMany(
    { _id: { $in: [new mongoose.Types.ObjectId(GEHAZ_FULL_ID), new mongoose.Types.ObjectId(GEHAZ_MINI_ID)] } },
    { $set: { slug: GEHAZ_SLUG } }
  );
  console.log(`  Slug "${GEHAZ_SLUG}" set on ${gehazSlugRes.modifiedCount} package(s).`);

  // 1b. comparisonFeatures + hero/callout on Full
  const gehazFullRes = await col.updateOne(
    { _id: new mongoose.Types.ObjectId(GEHAZ_FULL_ID) },
    { $set: { comparisonFeatures: GEHAZ_COMPARISON, ...HERO_CALLOUT } }
  );
  console.log(`  Full updated: matched=${gehazFullRes.matchedCount}, modified=${gehazFullRes.modifiedCount}`);

  // Verify
  const gehazFull = await col.findOne({ _id: new mongoose.Types.ObjectId(GEHAZ_FULL_ID) });
  console.log(`  Full "${gehazFull?.name}" → ${gehazFull?.comparisonFeatures?.length ?? 0} features, slug="${gehazFull?.slug}"`);
  const gehazMini = await col.findOne({ _id: new mongoose.Types.ObjectId(GEHAZ_MINI_ID) });
  console.log(`  Mini "${gehazMini?.name}" → slug="${gehazMini?.slug}"\n`);

  // ════════════════ Wedding Experience ════════════════
  console.log("── Wedding Experience ──");

  // 2a. Slug on both
  const weddingSlugRes = await col.updateMany(
    { _id: { $in: [new mongoose.Types.ObjectId(WEDDING_FULL_ID), new mongoose.Types.ObjectId(WEDDING_MINI_ID)] } },
    { $set: { slug: WEDDING_SLUG } }
  );
  console.log(`  Slug "${WEDDING_SLUG}" set on ${weddingSlugRes.modifiedCount} package(s).`);

  // 2b. comparisonFeatures + hero/callout on Full
  const weddingFullRes = await col.updateOne(
    { _id: new mongoose.Types.ObjectId(WEDDING_FULL_ID) },
    { $set: { comparisonFeatures: WEDDING_COMPARISON, ...HERO_CALLOUT } }
  );
  console.log(`  Full updated: matched=${weddingFullRes.matchedCount}, modified=${weddingFullRes.modifiedCount}`);

  // 3. Set packageProducts for ALL packages
  const PRODUCT_IDS = [
    new mongoose.Types.ObjectId("6a2d46f11e230a3850b036dc"),
    new mongoose.Types.ObjectId("694950a2533627401421a565"),
    new mongoose.Types.ObjectId("694954b957c1447541e98874"),
    new mongoose.Types.ObjectId("686c1be8b80e4dc848437dd8"),
  ];
  const prodResult = await col.updateMany(
    {},
    { $set: { packageProducts: PRODUCT_IDS } }
  );
  console.log(`\n  packageProducts set on ${prodResult.modifiedCount} package(s).`);

  // Verify
  const weddingFull = await col.findOne({ _id: new mongoose.Types.ObjectId(WEDDING_FULL_ID) });
  console.log(`  Full "${weddingFull?.name}" → ${weddingFull?.comparisonFeatures?.length ?? 0} features, slug="${weddingFull?.slug}"`);
  const weddingMini = await col.findOne({ _id: new mongoose.Types.ObjectId(WEDDING_MINI_ID) });
  console.log(`  Mini "${weddingMini?.name}" → slug="${weddingMini?.slug}"\n`);

  await mongoose.disconnect();
  console.log("Done. Disconnected.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
