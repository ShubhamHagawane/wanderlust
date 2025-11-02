const mongoose = require("mongoose");

async function checkDatabase(dbName) {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n=== Database: ${dbName} ===`);
    
    for (let coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`  ${coll.name}: ${count} documents`);
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.log(`Error checking ${dbName}:`, err.message);
  }
}

async function main() {
  // Check common database names
  await checkDatabase("wanderlust");
  await checkDatabase("wanderlust_copy");
  await checkDatabase("wanderlust_copyt");
  await checkDatabase("test");
}

main();