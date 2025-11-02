const mongoose = require("mongoose");
const Category = require("./models/category.js");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust_copyt")
  .then(async () => {
    console.log("Connected to DB");
    
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.icon} ${cat.name}`);
    });
    
    mongoose.connection.close();
  });