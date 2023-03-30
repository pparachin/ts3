const { TeamSpeak, QueryProtocol} = require("ts3-nodejs-library")
const ts_pass = require("./ts_pass")

const ts = new TeamSpeak({
    host: "81.0.217.180",
    protocol: QueryProtocol.RAW, //optional
    queryport: 10018, //optional
    serverport: 6516,
    username: "nodejs",
    password: ts_pass,
    nickname: "TS3-bot",
    readyTimeout: 10000
});

ts.on("error", () => {
    console.log("error");
})

module.exports = ts;