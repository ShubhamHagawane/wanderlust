const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const HostProfile = require("../models/hostProfile.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const {isLoggedIn} = require("../middleware.js");
const Review = require("../models/review.js");

// Show host profile
router.get("/host/:id", wrapAsync(async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    
    if(!user) {
        req.flash("error", "Host not found!");
        return res.redirect("/listings");
    }
    
    let hostProfile = await HostProfile.findOne({ user: id });
    
    // If profile doesn't exist, create a basic one
    if(!hostProfile) {
        hostProfile = new HostProfile({
            user: id,
            verifications: {
                email: true,  // Assume email is verified on registration
                phone: false,
                identity: false
            }
        });
        await hostProfile.save();
    }
    
     // Update stats - FIXED VERSION
    const listings = await Listing.find({ owner: id });
    hostProfile.totalListings = listings.length;

    // Get all reviews for host's listings
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
    
    // Get host's listings
    const displayListings = await Listing.find({ owner: id })
        .populate("category")
        .limit(6);
    
    res.render("hostProfile/show.ejs", { hostProfile, user, listings: displayListings });
}));
// Render edit host profile form
router.get("/host/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    
    // Check if user is authorized
    if(!req.user._id.equals(id)) {
        req.flash("error", "You are not authorized to edit this profile!");
        return res.redirect(`/host/${id}`);
    }
    
    let hostProfile = await HostProfile.findOne({ user: id });
    
    // If profile doesn't exist, create one
    if(!hostProfile) {
        hostProfile = new HostProfile({
            user: id,
            verifications: {
                email: true,
                phone: false,
                identity: false
            }
        });
        await hostProfile.save();
    }
    
    res.render("hostProfile/edit.ejs", { hostProfile });
}));

// Update host profile
router.put("/host/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    
    // Check if user is authorized
    if(!req.user._id.equals(id)) {
        req.flash("error", "You are not authorized to edit this profile!");
        return res.redirect(`/host/${id}`);
    }
    
    const { bio, phone, languages, profilePicture, responseTime } = req.body.hostProfile;
    
    // Process languages (convert comma-separated string to array)
    let languagesArray = [];
    if(languages) {
        languagesArray = languages.split(',').map(lang => lang.trim()).filter(lang => lang);
    }
    
    await HostProfile.findOneAndUpdate(
        { user: id },
        {
            bio,
            phone,
            languages: languagesArray,
            profilePicture,
            responseTime
        }
    );
    
    req.flash("success", "Host profile updated!");
    res.redirect(`/host/${id}`);
}));

// Show all host's listings
router.get("/host/:id/listings", wrapAsync(async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    
    if(!user) {
        req.flash("error", "Host not found!");
        return res.redirect("/listings");
    }
    
    const listings = await Listing.find({ owner: id })
        .populate("category")
    
    const hostProfile = await HostProfile.findOne({ user: id });
    
    res.render("hostProfile/listings.ejs", { user, listings, hostProfile });
}));

module.exports = router;