const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const { getUsers } = require("../controllers/user.controller.js");

var router = express.Router();

router.get("/", protectRoute, getUsers);

module.exports = router;
