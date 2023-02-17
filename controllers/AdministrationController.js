const { Router } = require("express");
const { isLoggedIn } = require("./middleware");

const router = Router();

router.get("/", isLoggedIn ,async (req, res) => {
   res.render("administration");
});

module.exports = router;