const ts = require("../ts3_connection");
const Client = require("../database/models/TeamSpeakClient");

/**
 * Function get list of actual online clients on server
 *
 * @returns {Promise<*[]>} Array of currently connected users
 */
async function getOnlineClients(){
    let connected_clients = [];
    const clients = await ts.clientList({ clientType: 0 })
    if (clients){
        clients.forEach(client => {
            connected_clients.push(client);
        });
    }
    return connected_clients;
}

/**
 * This function compares the users currently connected
 * to the server with records from the db
 *
 * @param {Array} connected_clients Array of currently connected users
 * @returns {Promise<*[]>} Array of currently connected users but with information from db
 */
async function compareOnlineToDb(connected_clients){
    let clients = [];
    if (connected_clients){
        for (const client of connected_clients) {
            if (await Client.findOne({ "unique_identifier" : client.propcache.clientUniqueIdentifier})){
                const clientFromDb = await Client.findOne({"unique_identifier": client.propcache.clientUniqueIdentifier});
                clients.push(clientFromDb);
            }
        }
    }
    return clients;
}

/**
 * Function handling new user connect event, then check if the user is already in db,
 * if yes just update last connect time in db, if no create new record in db
 *
 * @returns {Promise<void>}
 */
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

/**
 * Function is handling disconnect of user event
 * and updating user's spent time on server
 *
 * @returns {Promise<void>}
 */
async function onDisconnect(){
    ts.on("clientdisconnect", async ev => {
        const id_client = ev.client.propcache.clientUniqueIdentifier;
        const client = await Client.findOne({"unique_identifier": id_client});
        console.log(client.last_connected);
        const spent_time = Math.floor(((Date.now() / 1000) - client.last_connected) / 60)
        if (client.time_spent){
            const new_time = client.time_spent + spent_time;
            await client.updateOne({"time_spent": new_time});
        } else {
            await client.updateOne({"time_spent" : spent_time});
        }
    })
}

module.exports.getOnlineClients = getOnlineClients;
module.exports.onConnect = onConnect;
module.exports.compareOnlineToDb = compareOnlineToDb;
module.exports.onDisconnect = onDisconnect;