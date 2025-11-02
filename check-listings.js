const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust_copyt")
  .then(async () => {
    console.log("Connected to DB");
    
    const listings = await Listing.find({}).populate('category');
    console.log(`Found ${listings.length} listings`);
    
    // Check first 3 listings
    listings.slice(0, 3).forEach(listing => {
      console.log(`\n${listing.title}`);
      console.log(`  Category: ${listing.category ? listing.category.name : 'NO CATEGORY'}`);
    });
    
    // Count listings without categories
    const withoutCategory = listings.filter(l => !l.category).length;
    console.log(`\n${withoutCategory} listings without category`);
    
    mongoose.connection.close();
  });