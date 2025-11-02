const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Category = require("../models/category.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust_copy";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // Fetch all categories from database
  const categories = await Category.find({});
  
  // Create a map of category names to their IDs
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });
  
  // Update listings with category ObjectIds instead of strings
  const listingsWithCategoryIds = initData.data.map(listing => {
    return {
      ...listing,
      category: categoryMap[listing.category] || categoryMap["Rooms"] // Default to "Rooms" if not found
    };
  });
  
  await Listing.insertMany(listingsWithCategoryIds);
  console.log("data was initialized");
};

initDB().then(() => {
  mongoose.connection.close();
});