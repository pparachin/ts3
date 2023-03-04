const mongo = require("../db.js");

const clientSchema = new mongo.Schema({
    nickname: {type: String, required: true},
    last_connected: {type: Number},
    created: {type: Number},
    database_id: {type: String},
    unique_identifier: {type: String},
    country: {type: String},
    time_spent: {type: Number},
    ip_address: {type: String},
    platform: {type: String}
});

module.exports = mongo.model("Client", clientSchema);