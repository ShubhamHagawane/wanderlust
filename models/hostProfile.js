const mongoose = require('mongoose');

const hostProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    phone: {
        type: String,
        trim: true
    },
    languages: {
        type: [String],
        default: []
    },
    profilePicture: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    },
    location: {
        type: String,
        trim: true
    },
    responseRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    responseTime: {
        type: String,
        enum: ["Within an hour", "Within a few hours", "Within a day", "A few days or more"],
        default: "Within a day"
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    isSuperhost: {
        type: Boolean,
        default: false
    },
    verifications: {
        email: {
            type: Boolean,
            default: false
        },
        phone: {
            type: Boolean,
            default: false
        },
        identity: {
            type: Boolean,
            default: false
        }
    },
    website: String,
    about: {
        type: String,
        maxlength: 1000
    }
});

// Method to calculate hosting stats
hostProfileSchema.methods.getStats = async function() {
    const Listing = require('./listing.js');
    const Review = require('./review.js');
    const Booking = require('./booking.js');
    
    const listings = await Listing.find({ owner: this.user });
    const listingIds = listings.map(l => l._id);
    
    // Count total listings
    const totalListings = listings.length;
    
    // Count total reviews across all listings
    let totalReviews = 0;
    let totalRating = 0;
    for(let listing of listings) {
        const reviews = await Review.find({ _id: { $in: listing.reviews } });
        totalReviews += reviews.length;
        reviews.forEach(review => {
            totalRating += review.rating;
        });
    }
    
    const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
    
    // Count completed bookings
    const completedBookings = await Booking.countDocuments({
        listing: { $in: listingIds },
        status: "completed"
    });
    
    return {
        totalListings,
        totalReviews,
        avgRating,
        completedBookings,
        yearsHosting: Math.floor((Date.now() - this.joinedDate) / (365 * 24 * 60 * 60 * 1000))
    };
};

module.exports = mongoose.model("HostProfile", hostProfileSchema);