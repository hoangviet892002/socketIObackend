var authRoutes = require("./auth");
var messageRoutes = require("./message");
var userRoutes = require("./user");
var roomRoutes = require("./room");
var paymentRoutes = require("./payment");
var gameRoutes = require("./game");
function route(app) {
  app.use("/api/auth", authRoutes);

  app.use("/api/message", messageRoutes);

  app.use("/api/user", userRoutes);

  app.use("/api/room", roomRoutes);

  app.use("/api/order", paymentRoutes);

  app.use("/api/game", gameRoutes);
}
module.exports = route;
