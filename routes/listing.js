const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing,isHost} = require("../middleware.js");
const Category = require("../models/category.js");
const HostProfile = require("../models/hostProfile.js"); 

//index route - FIXED: Now fetches categories
router.get("/", 
    wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({}).populate('category');
    const categories = await Category.find({}); // Fetch categories
    
    console.log("Categories found:", categories.length); // Debug
    console.log("Listings found:", allListings.length); // Debug
    
    res.render("listings/index.ejs", {allListings, categories}); // Pass categories
}));

// New route - pass categories
router.get("/new", isHost, wrapAsync(async (req, res) => {
    const categories = await Category.find({});
    res.render("listings/new.ejs", {categories});
}));

// Add this BEFORE the "/:id" route (important for route order)
router.get("/categories", 
    wrapAsync(async (req, res) => {
    const categories = await Category.find({});
    res.render("categories/index.ejs", {categories});
}));

//show route
router.get("/:id",
    wrapAsync(async (req,res)=>{
        const {id} = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" }
            })
            .populate("owner")
            .populate("category");

        if(!listing){
            req.flash("error","listing you requested for does not exist!");
            return res.redirect("/listings");
        }
        console.log(listing);
        return res.render("listings/show.ejs",{listing});
}));


//create route
router.post("/",
    isHost,
    validateListing,
    wrapAsync(async(req,res,next)=>{
    const newListing =new Listing(req.body.listing);
    newListing.owner = req.user._id; 
    await newListing.save();
    req.flash("success","new  listing created!");
     // Update host profile stats
    const hostProfile = await HostProfile.findOne({ user: req.user._id });
    if (hostProfile) {
        const listings = await Listing.find({ owner: req.user._id });
        hostProfile.totalListings = listings.length;
        await hostProfile.save();
    }

    req.flash("success", "New listing created!");
    res.redirect("/listings");
}));

// Edit route - pass categories
router.get("/:id/edit", isHost, isOwner, wrapAsync(async(req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("category");
    const categories = await Category.find({});
    res.render("listings/edit.ejs", {listing, categories});
}));


//update route
router.put("/:id", 
    isHost,
    isOwner,
    validateListing,
    wrapAsync(async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","listing updated!");
    res.redirect(`/listings/${id}`);
}));

// DELETE route - FIXED VERSION
router.delete("/:id", isHost, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if(!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    const ownerId = listing.owner;  // Save owner ID BEFORE deleting
    
    // Now delete the listing
    await Listing.findByIdAndDelete(id);
    
    // Update host profile stats after deletion
    const hostProfile = await HostProfile.findOne({ user: ownerId });
    if (hostProfile) {
        const listings = await Listing.find({ owner: ownerId });
        hostProfile.totalListings = listings.length;
        
        const listingIds = listings.map(l => l._id);
        const allListings = await Listing.find({ _id: { $in: listingIds } }).populate('reviews');
        
        let totalReviews = 0;
        let totalRating = 0;
        
        for(let listing of allListings) {
            totalReviews += listing.reviews.length;
            for(let review of listing.reviews) {
                totalRating += review.rating;
            }
        }
        
        hostProfile.totalReviews = totalReviews;
        hostProfile.averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
        
        await hostProfile.save();
    }
    
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
}));

module.exports = router;