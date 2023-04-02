const express = require('express');
const app = express();
const path = require("path");
const {log} = require("mercedlogger");
const session = require("express-session");
const User = require('./database/models/User');
const http = require("http");
const server = http.createServer(app)
const {Server} = require("socket.io");
const io = new Server(server);
require("dotenv").config();
const bodyParser = require("body-parser");
const {onConnect, onDisconnect} = require("./controllers/TeamSpeakClientsController");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('socketio', io);

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
app.locals.moment = require('moment')
app.use(express.static(path.resolve('./public')));

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


onConnect();
onDisconnect();

passport.use("local", local);

app.use(function (req, res, next){
    res.locals.login = req.user;
    next();
});
app.use("/", require("./routes/router")(passport));

const { PORT = 3000 } = process.env;
server.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));

