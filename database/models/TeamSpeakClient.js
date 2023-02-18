const mongo = require("../db.js");

const clientSchema = new mongo.Schema({
    nickname: {type: String, required: true},
    last_connected: {type: Number},
    created: {type: Number},
    database_id: {type: String},
    unique_identifier: {type: String},
    country: {type: String},
    time_spent: {type: Number}
});

module.exports = mongo.model("Client", clientSchema);