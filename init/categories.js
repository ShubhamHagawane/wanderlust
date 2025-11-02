const mongoose = require("mongoose");
const Category = require("../models/category.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust_copy';

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const sampleCategories = [
    {
        name: "Trending",
        description: "Popular and unique stays everyone's talking about",
        icon: "🔥",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
    },
    {
        name: "Rooms",
        description: "Cozy rooms and charming accommodations",
        icon: "🏠",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    },
    {
        name: "Iconic Cities",
        description: "Stay in the heart of world-famous cities",
        icon: "🏙️",
        image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800"
    },
    {
        name: "Mountains",
        description: "Mountain retreats with breathtaking views",
        icon: "⛰️",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    },
    {
        name: "Castles",
        description: "Historic castles and grand villas",
        icon: "🏰",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
    },
    {
        name: "Amazing Pools",
        description: "Properties with stunning swimming pools",
        icon: "🏊",
        image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800"
    },
    {
        name: "Camping",
        description: "Rustic cabins and outdoor camping experiences",
        icon: "⛺",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"
    },
    {
        name: "Farms",
        description: "Farm stays and rural agricultural experiences",
        icon: "🚜",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
    },
    {
        name: "Arctic",
        description: "Cold climate destinations and winter wonderlands",
        icon: "❄️",
        image: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=800"
    },
    {
        name: "Beaches",
        description: "Beachfront properties with ocean views",
        icon: "🏖️",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    }
];

const initDB = async () => {
    await Category.deleteMany({});
    await Category.insertMany(sampleCategories);
    console.log("Categories initialized successfully!");
};

initDB().then(() => {
    mongoose.connection.close();
});