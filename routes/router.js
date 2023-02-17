const express = require('express');
const router = express.Router();
const ts = require("../ts3_connection");
const User = require("../database/models/User");

// GET Routes
const loggedInOnly = (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.redirect("/login");
};

const loggedOutOnly = (req, res, next) => {
    if (req.isUnauthenticated()) next();
    else res.redirect("/");
};

// Route Handlers
function authenticate(passport) {
    // Main Page
    router.get("/", loggedInOnly,async (req, res) => {
        const clients = await ts.clientList()
        ts.serverInfo().then().then(server_info => {
            res.render("home", {server_info: server_info, clients: clients, title: "Home", req: req});
        });
    });

    // Login View
    router.get("/login", loggedOutOnly, (req, res) => {
        res.render("login", {title: "Login"});
    });

    router.get("/administration", loggedInOnly, (req, res) => {
        res.render("administration");
    })

    // Login Handler
    router.post(
        "/login",
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/login",
            failureFlash: true
        }),
        passport.authenticate("local", { error: "Invalid username or password" })
    );

    // Register View
    router.get("/register", loggedOutOnly, (req, res) => {
        res.render("register");
    });

    // Register Handler
    router.post("/register", (req, res, next) => {
        const { username, password } = req.body;
        User.create({ username, password })
            .then(user => {
                req.login(user, err => {
                    if (err) next(err);
                    else res.redirect("/");
                });
            })
            .catch(err => {
                if (err.name === "ValidationError") {
                    req.flash("Sorry, that username is already taken.");
                    res.redirect("/register");
                } else next(err);
            });
    });

    // Logout Handler
    router.all("/logout", function(req, res) {
        req.logout(function (err){
            if(err) {return next(err);}
            res.redirect("/login");
        });
    });

    // Error Handler

    return router;
}

module.exports = authenticate;