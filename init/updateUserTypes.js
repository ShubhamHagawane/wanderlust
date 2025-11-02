const mongoose = require("mongoose");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const HostProfile = require("../models/hostProfile.js");

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

const updateUsers = async () => {
    // Get all users
    const users = await User.find({});
    
    for(let user of users) {
        // Check if user has listings
        const listingCount = await Listing.countDocuments({ owner: user._id });
        
        if(listingCount > 0) {
            // User has listings, make them a host
            user.userType = "host";
            await user.save();
            
            // Create host profile if doesn't exist
            let hostProfile = await HostProfile.findOne({ user: user._id });
            if(!hostProfile) {
                hostProfile = new HostProfile({
                    user: user._id,
                    verifications: {
                        email: true,
                        phone: false,
                        identity: false
                    }
                });
                await hostProfile.save();
            }
            
            console.log(`${user.username} upgraded to host`);
        } else {
            // User has no listings, make them a guest
            user.userType = "guest";
            await user.save();
            console.log(`${user.username} set as guest`);
        }
    }
    
    console.log("All users updated!");
};

updateUsers().then(() => {
    mongoose.connection.close();
});