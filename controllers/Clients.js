const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const ts = require("../ts3_connection");

const router = Router();

router.get("/", isLoggedIn ,async (req, res) => {

});

module.exports = router;