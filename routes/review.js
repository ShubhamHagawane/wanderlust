const express = require("express");
const router = express.Router({mergeParams: true});  // mergeParams is important to access :id from parent route
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn,isReviewAuther} = require("../middleware.js");
const HostProfile = require("../models/hostProfile.js");  // Add this

// POST Review route
router.post("/", 
    isLoggedIn,
    validateReview,
    wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();

      // Update host profile stats
    const hostProfile = await HostProfile.findOne({ user: listing.owner });
    if (hostProfile) {
        await hostProfile.updateStats();
    }
    
    req.flash("success","new  review created!");
    console.log("Review saved successfully");
    res.redirect(`/listings/${req.params.id}`);
}));

// DELETE Review route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuther,
    wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);


    // Update host profile stats
    const hostProfile = await HostProfile.findOne({ user: listing.owner });
    if (hostProfile) {
        await hostProfile.updateStats();
    }
    
    req.flash("success","  review deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;