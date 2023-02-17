const express = require('express');
const app = express();
const path = require("path");
const {log} = require("mercedlogger");
const session = require("express-session");
const User = require('./database/models/User');
const Client = require('./database/models/TeamSpeakClient');
require("dotenv").config();
const bodyParser = require("body-parser");
const TeamsSpeakClients = require("./controllers/TeamSpeakClientsController");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret:
            process.env.SECRET
    }),
);
app.use(bodyParser.urlencoded({ extended: true }));

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(userId, done) {
    User.findById(userId, (err, user) => done(err, user));
});

const LocalStrategy = require("passport-local").Strategy;
const local = new LocalStrategy((username, password, done) => {
    User.findOne({ username })
        .then(user => {
            if(!user || !user.validPassword(password)){
                done(null, false, { error: "Invalid username/password" });
            } else {
                done(null, user);
            }
        })
        .catch(e => done(e));
})

TeamsSpeakClients().then(function (result){
   result.forEach(client => {
       let nickname = client.propcache.clientNickname;
       let last_connected = client.propcache.clientLastconnected;
       let created = client.propcache.created;
       let database_id = client.propcache.clientDatabaseId;
       let unique_identifier = client.propcache.clientUniqueIdentifier;
       let country = client.propcache.clientCountry;

       if (!Client.findOne({ "nickname": nickname})){
           Client.create({nickname, last_connected, created, database_id, unique_identifier, country});
       }
   });
});

passport.use("local", local);

app.use(function (req, res, next){
    res.locals.login = req.user;
    next();
});

app.use("/", require("./routes/router")(passport));

const { PORT = 3000 } = process.env;
app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));

