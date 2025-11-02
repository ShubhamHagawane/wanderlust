const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,  // Emoji or Font Awesome class
        required: true
    },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    }
});

module.exports = mongoose.model("Category", categorySchema);