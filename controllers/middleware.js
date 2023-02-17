require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../database/models/User");
const {json} = require("express");
const { SECRET = "secret" } = process.env;
const UserRouter = require("./UserController");

const createContext = (req, res, next) => {
  req.context = {
      models: {
          User
      },
  };
  next();
};

const isLoggedIn = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token){
        jwt.verify(token, SECRET, (err, decodedToken) => {
           if(err){
               return res.status(401).json({ message: "Not authorized" });
           } else {
               next();
           }
        });
    } else {
        req.cookies.error = "You need to login first!";
        res.redirect("/user/login");
    }
}

module.exports = {
    isLoggedIn,
    createContext
};