const express = require('express');
const router = express.Router();
const ts = require("../ts3_connection");
const {getOnlineClients, compareOnlineToDb} = require("../controllers/TeamSpeakClientsController");
const Client = require("../database/models/TeamSpeakClient");
const {TeamSpeakChannel} = require("ts3-nodejs-library");
const {getUsers} = require("../controllers/UsersController");
const bcrypt = require("bcrypt");
const User = require("../database/models/User");

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
        const clients_db = await compareOnlineToDb(clients);
        const server_info = await ts.serverInfo();
        res.render("home", {server_info: server_info, clients: clients, title: "Home", req: req, clients_db: clients_db});
    });

    router.get("/clients", async (req, res) => {
       let io = req.app.get('socketio');
       io.on('connection', async (socket) => {
           const clients = await getOnlineClients();
           console.log(clients)
       });
       res.render("clients");
    });

    // Login View
    router.get("/login", loggedOutOnly, (req, res) => {
        res.render("login", {title: "Login"});
    });

    // Administration View
    router.get("/administration/index", loggedInOnly, async (req, res) => {
        res.render("administration/index", {title: "Administration"});
    });

    /* TODO:
        Const users is sometimes not defined, so it will throw error when the page is loading
        Need to figure out how to fix this
     */
    router.get("/administration/users/index", loggedInOnly, async (req, res) => {
        const users = await getUsers();
        res.render("administration/users/index", {title: "Administration - users", users: users});
    });

    router.get("/administration/users/add", loggedInOnly, async (req, res) => {
        res.render("administration/users/add", {title: "Administration - Add user"});
    });

    router.post("/administration/users/delete", loggedInOnly, async (req, res) => {
        const id = req.body.id;
        await User.deleteOne({_id: id});
    });

    router.post("/administration/users/add", loggedInOnly,async (req, res, next) => {
        const username = req.body.username;
        let password = req.body.password;
        password = await bcrypt.hashSync(password, 10);
        User.create({username, password})
            .then(user => {
                // req.flash("User " + user.username + "was successfully added to db.")
                res.redirect("/administration/users/index");
            })
            .catch(err => {
                if (err.name === "ValidationError") {
                    req.flash("Sorry, that username is already taken.");
                    res.redirect("/administration/users/add");
                } else next(err);
            });
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

    // Logout Handler
    router.all("/logout", function(req, res) {
        req.logout(function (err){
            if(err) {return next(err);}
            res.redirect("/login");
        });
    });

    router.post("/administration/user/poke", async function (req, res){
        const clients = await getOnlineClients();
        await clients[req.body.id].poke(req.body.poke_message)
    });

    router.post("/administration/user/kick", async function (req, res){
        const clients = await getOnlineClients();
        await clients[req.body.id].kickFromServer(req.body.message);
    });

    router.post("/administration/user/ban", async function(req, res){
       const clients = await getOnlineClients();
       await clients[req.body.id].ban(req.body.ban_message, req.body.ban_length);
    });


    // TODO
    // Error Handler

    return router;
}

module.exports = authenticate;