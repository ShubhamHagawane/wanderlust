const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const User = require("../models/user.js");
const HostProfile = require("../models/hostProfile.js");

// Show signup choice page
router.get("/signup", (req, res) => {
    res.render("user/signupChoice.ejs");
});

// Render guest signup form
router.get("/signup/guest", (req, res) => {
    res.render("user/guestSignup.ejs");
});

// Render host signup form
router.get("/signup/host", (req, res) => {
    res.render("user/hostSignup.ejs");
});

// Handle guest signup
router.post("/signup/guest", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ 
            email, 
            username,
            userType: "guest"
        });
        const registeredUser = await User.register(newUser, password);
        
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust! Start exploring amazing places.");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup/guest");
    }
}));

// Handle host signup
router.post("/signup/host", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ 
            email, 
            username,
            userType: "host"
        });
        const registeredUser = await User.register(newUser, password);
        
        // Create host profile automatically
        const hostProfile = new HostProfile({
            user: registeredUser._id,
            verifications: {
                email: true,
                phone: false,
                identity: false
            }
        });
        await hostProfile.save();
        
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust! You can now list your properties.");
            res.redirect("/listings/new");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup/host");
    }
}));

// Render login form
router.get("/login", (req, res) => {
    res.render("user/login.ejs");
});

// Handle login
router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
);

// Handle logout
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

// Upgrade guest to host
router.post("/become-host", wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    
    const user = await User.findById(req.user._id);
    
    if(user.userType === "host") {
        req.flash("error", "You are already a host!");
        return res.redirect("/listings");
    }
    
    // Upgrade to host
    user.userType = "host";
    await user.save();
    
    // Create host profile
    const hostProfile = new HostProfile({
        user: user._id,
        verifications: {
            email: true,
            phone: false,
            identity: false
        }
    });
    await hostProfile.save();
    
    req.flash("success", "Congratulations! You are now a host. Start listing your properties.");
    res.redirect("/listings/new");
}));

module.exports = router;