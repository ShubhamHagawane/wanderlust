const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate number of nights
bookingSchema.methods.calculateNights = function() {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((this.checkOut - this.checkIn) / oneDay));
};

module.exports = mongoose.model("Booking", bookingSchema);