const {Schema, model} = require("../db.js");

const userSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

const User = model("User", userSchema);

module.exports = User;