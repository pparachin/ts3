require("dotenv").config();
const {Router} = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = Router();

const { SECRET = "secret" } = process.env;

// Register routes
router.get('/register', (req, res) => {
    res.render("register");
});

router.post('/register', async (req, res) => {
    const { User } = req.context.models;
    try{
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const user = await User.create(req.body);
        res.json(user);
        res.render('register', {success: "User was successfully registered!"});
    } catch (error){
        res.render('register', {error: "Something went wrong during registration, try it again later please."})
    }
});


// Login routes
router.get('/login',(req, res) => {
    res.render('login', {title: 'Login'});
});

router.post('/login',  async (req, res, next) => {
    const { User } = req.context.models;
    try{
        const user = await User.findOne({ 'username': req.body.username});
        if(user){
            console.log(user.password)
            const result = await bcrypt.compare(req.body.password, user.password);
            if (result) {
                const token = await jwt.sign({user_id: user._id, username: user.username}, SECRET,{
                    expiresIn: "2h",
                });
                res.cookie("jwt", token, {
                    httpOnly: true
                });
                res.redirect("/");
            } else {
                res.json(user).render('login', {error: "Password doesn't match"});
            }
        } else {
            res.status(401).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});


// Logout
router.get("/logout", (req, res) => {
   res.cookie("jwt", "");
   res.redirect("/");
});

module.exports = router;