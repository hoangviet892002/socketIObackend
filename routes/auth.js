var express = require("express");
var router = express.Router();
const { signup, login, logout } = require("../controllers/auth.controller");

router.get("/", function (req, res, next) {
  res.render("index", { title: "Auth" });
});
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

module.exports = router;
