const ts = require("../ts3_connection");
const express = require('express');
const client = require("../database/models/TeamSpeakClient");

async function getClients(){
    var connected_clients = [];
    const clients = await ts.clientList({ clientType: 0 })
    clients.forEach(client => {
        connected_clients.push(client);
    });
    return connected_clients;
}

module.exports = getClients;