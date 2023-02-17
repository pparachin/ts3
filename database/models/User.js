const mongo = require("../db.js");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongo.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(passportLocalMongoose);
userSchema.methods.validPassword = function (password){
  return bcrypt.compareSync(password, this.password);
};
userSchema.virtual("password_hash").set(function (value){
   this.password = bcrypt.hashSync(value, 10);
});

module.exports = mongo.model('User', userSchema);