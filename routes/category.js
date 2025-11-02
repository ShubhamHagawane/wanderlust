const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Category = require("../models/category.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isHost} = require("../middleware.js");

// Show all categories (for admin/homepage)
router.get("/categories", wrapAsync(async (req, res) => {
    const categories = await Category.find({});
    res.render("categories/index.ejs", {categories});
}));

// Show category form (admin only)
router.get("/categories/new", isLoggedIn, (req, res) => {
    res.render("categories/new.ejs");
});

// Create new category (admin only)
router.post("/categories", isHost, wrapAsync(async (req, res) => {
    const newCategory = new Category(req.body.category);
    await newCategory.save();
    req.flash("success", "New category created!");
    res.redirect("/categories");
}));

// Show listings by category
router.get("/categories/:id/listings", wrapAsync(async (req, res) => {
    const {id} = req.params;
    const category = await Category.findById(id);
    
    if(!category) {
        req.flash("error", "Category not found!");
        return res.redirect("/categories");
    }
    
    const listings = await Listing.find({category: id}).populate("owner");
    res.render("categories/listings.ejs", {category, listings});
}));

// Edit category form (admin only)
router.get("/categories/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const category = await Category.findById(id);
    
    if(!category) {
        req.flash("error", "Category not found!");
        return res.redirect("/categories");
    }
    
    res.render("categories/edit.ejs", {category});
}));

// Update category (admin only)
router.put("/categories/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    await Category.findByIdAndUpdate(id, {...req.body.category});
    req.flash("success", "Category updated!");
    res.redirect("/categories");
}));

// Delete category (admin only)
router.delete("/categories/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    
    // Check if any listings use this category
    const listingsCount = await Listing.countDocuments({category: id});
    
    if(listingsCount > 0) {
        req.flash("error", `Cannot delete category. ${listingsCount} listings are using it.`);
        return res.redirect("/categories");
    }
    
    await Category.findByIdAndDelete(id);
    req.flash("success", "Category deleted!");
    res.redirect("/categories");
}));

module.exports = router;