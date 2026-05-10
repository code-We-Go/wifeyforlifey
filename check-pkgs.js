const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const match = envFile.match(/MONGODB_URI=([^\n]+)/);
  if (!match) {
    console.error("No MONGODB_URI found");
    process.exit(1);
  }
  const uri = match[1].trim();

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const packages = await db.collection('packages').find({}).toArray();
  for (const pkg of packages) {
    console.log(`_id: ${pkg._id}, name: ${pkg.packageName}, slug: ${pkg.slug}`);
  }
  process.exit(0);
}
check();
