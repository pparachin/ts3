const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const ts = require("../ts3_connection");

const router = Router();

router.get("/", isLoggedIn ,async (req, res) => {
    const clients = await ts.clientList()
    ts.serverInfo().then().then(server_info => {
        res.render("home", {server_info: server_info, clients: clients, title: "Home"});
    });
});

module.exports = router;