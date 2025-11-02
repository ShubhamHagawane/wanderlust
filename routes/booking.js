const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");

// Show booking form
router.get("/listings/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("owner");
    
    if(!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    res.render("bookings/new.ejs", {listing});
}));

// Create booking
router.post("/listings/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    
    if(!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    const {checkIn, checkOut, guests} = req.body.booking;
    
    // Calculate total price
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.round(Math.abs((new Date(checkOut) - new Date(checkIn)) / oneDay));
    const totalPrice = nights * listing.price;
    
    // Check if dates are valid
    if(new Date(checkIn) >= new Date(checkOut)) {
        req.flash("error", "Check-out date must be after check-in date!");
        return res.redirect(`/listings/${id}/book`);
    }
    
    if(new Date(checkIn) < new Date()) {
        req.flash("error", "Check-in date cannot be in the past!");
        return res.redirect(`/listings/${id}/book`);
    }
    
    // Create new booking
    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: guests,
        totalPrice: totalPrice,
        status: "pending"
    });
    
    await newBooking.save();
    console.log("Booking saved:", newBooking); 
    
    req.flash("success", "Booking request sent successfully!");
    res.redirect(`/bookings/${newBooking._id}`);
}));

// Show single booking
router.get("/bookings/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const booking = await Booking.findById(id)
        .populate("listing")
        .populate("user");
    
    if(!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/bookings");
    }
    
    // Check if user is authorized to view this booking
    if(!booking.user._id.equals(req.user._id)) {
        req.flash("error", "You are not authorized to view this booking!");
        return res.redirect("/bookings");
    }
    
    const nights = booking.calculateNights();
    res.render("bookings/show.ejs", {booking, nights});
}));

// Show all user's bookings
router.get("/bookings", isLoggedIn, wrapAsync(async (req, res) => {
    const bookings = await Booking.find({user: req.user._id})
        .populate("listing")
        .sort({createdAt: -1});
    
    res.render("bookings/index.ejs", {bookings});
}));

// Show bookings for listing owner
router.get("/my-bookings", isLoggedIn, wrapAsync(async (req, res) => {
    console.log("Current user ID:", req.user._id);
    // Get all listings owned by current user
    const myListings = await Listing.find({owner: req.user._id});
    const listingIds = myListings.map(listing => listing._id);
    
    // Get all bookings for these listings
    const bookings = await Booking.find({listing: {$in: listingIds}})
        .populate("listing")
        .populate("user")
        .sort({createdAt: -1});
    
    console.log("Bookings found:", bookings.length);    
    res.render("bookings/manage.ejs", {bookings});
}));

// Update booking status
router.patch("/bookings/:id/status", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const {status} = req.body;
    
    const booking = await Booking.findById(id).populate("listing");
    
    if(!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/my-bookings");
    }
    
    // Check if user is the listing owner
    if(!booking.listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to update this booking!");
        return res.redirect("/my-bookings");
    }
    
    booking.status = status;
    await booking.save();
    
    req.flash("success", `Booking ${status} successfully!`);
    res.redirect("/my-bookings");
}));

// Cancel booking
router.delete("/bookings/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const booking = await Booking.findById(id);
    
    if(!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/bookings");
    }
    
    // Check if user owns this booking
    if(!booking.user.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this booking!");
        return res.redirect("/bookings");
    }
    
    booking.status = "cancelled";
    await booking.save();
    
    req.flash("success", "Booking cancelled successfully!");
    res.redirect("/bookings");
}));

module.exports = router;