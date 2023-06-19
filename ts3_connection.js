const { TeamSpeak, QueryProtocol} = require("ts3-nodejs-library")
const ts_pass = require("./ts_pass")

const ts = new TeamSpeak({
    host: "172.104.243.185",
    protocol: QueryProtocol.RAW, //optional
    queryport: 10011, //optional
    serverport: 9987,
    username: "serveradmin",
    password: ts_pass,
    nickname: "TS3-bot",
    readyTimeout: 10000
});

ts.on("error", () => {
    console.log("error");
})

module.exports = ts;