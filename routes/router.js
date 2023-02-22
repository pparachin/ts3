const express = require('express');
const router = express.Router();
const ts = require("../ts3_connection");
const User = require("../database/models/User");
const {getOnlineClients, allClients} = require("../controllers/TeamSpeakClientsController");
const Client = require("../database/models/TeamSpeakClient");
const {all} = require("express/lib/application");

// Authorization const
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
    router.get("/",async (req, res) => {
        const clients = await getOnlineClients();
        const server_info = await ts.serverInfo();
        res.render("home", {server_info: server_info, clients: clients, title: "Home", req: req});
    });

    // Login View
    router.get("/login", loggedOutOnly, (req, res) => {
        res.render("login", {title: "Login"});
    });

    // Administration View
    router.get("/administration/index", loggedInOnly, async (req, res) => {
        res.render("administration/index", {title: "Administration"});
    });

    router.get("/administration/users", loggedInOnly, async (req, res) => {
        const clients = await getOnlineClients();
        res.render("administration/users", {title: "Administration - users", clients: clients});
    });

    router.get("/administration/clients", loggedInOnly, (req, res) => {
       Client.find({}, function (error, result){
           if(!error){
               res.render("administration/clients", {title: "Administration - clients", clients: result});
           } else {
               throw error;
           }
       }).clone().catch(function (error){console.log(error)})
    });

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

    router.post("/administration/user/poke", async function (req, res){
        const clients = await getOnlineClients();
        await clients[req.body.id].poke("test")
    });

    router.post("/administration/user/kick", async function (req, res){
        const clients = await getOnlineClients();
        await clients[req.body.id].kickFromServer("prd");
    });

    router.post("/administration/user/ban", async function(req, res){
       const clients = await getOnlineClients();
       await clients[req.body.id].ban("test", 60);
    });


    // TODO
    // Error Handler

    return router;
}

module.exports = authenticate;