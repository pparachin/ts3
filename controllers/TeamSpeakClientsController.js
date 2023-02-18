const ts = require("../ts3_connection");
const Client = require("../database/models/TeamSpeakClient");

async function getClients(){
    var connected_clients = [];
    const clients = await ts.clientList({ clientType: 0 })
    clients.forEach(client => {
        connected_clients.push(client);
    });
    return connected_clients;
}

async function onConnect(){
    ts.on("clientconnect", async ev => {
        console.log(ev.client.propcache.clientUniqueIdentifier);
        let id_client = ev.client.propcache.clientUniqueIdentifier;
        if (await Client.findOne({"unique_identifier": id_client})) {
            await Client.updateOne({"unique_identifier" : id_client}, {
                last_connected: ev.client.propcache.clientLastconnected
            });
        } else {
            let nickname = ev.client.propcache.clientNickname;
            let last_connected = ev.client.propcache.clientLastconnected;
            let created = ev.client.propcache.clientCreated;
            let database_id = ev.client.propcache.clientDatabaseId;
            let unique_identifier = ev.client.propcache.clientUniqueIdentifier;
            let country = ev.client.propcache.clientCountry;
            console.log("Db create")
            await Client.create({nickname, last_connected, created, database_id, unique_identifier, country});
        }
    });
}

module.exports.getClients = getClients;
module.exports.onConnect = onConnect;