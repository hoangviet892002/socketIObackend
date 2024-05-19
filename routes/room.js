const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const { joinRoom, getRooms } = require("../controllers/room.controller");

var router = express.Router();

router.post("/", protectRoute, getRooms);

router.post("/join", protectRoute, joinRoom);

module.exports = router;
