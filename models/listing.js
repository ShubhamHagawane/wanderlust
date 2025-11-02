const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
const default_img ="https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
    title :{ 
       type: String,
       required : true,
    },
    description: String,
     image: {
        type: String,
        set: (v)=>
            v===""
            ?default_img
            :v,
    },
        
    price : Number,
    location : String,
    country : String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {  // Add this field
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false
    }
});

// Mongoose middleware - deletes all reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;