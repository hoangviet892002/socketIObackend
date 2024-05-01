var express = require("express");
var router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const {
  getMessages,
  sendMessage,
} = require("../controllers/message.controller");

router.get("/", function (req, res, next) {
  res.render("index", { title: "Message" });
});
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

module.exports = router;
