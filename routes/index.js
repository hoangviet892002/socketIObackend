var authRoutes = require("./auth");
var messageRoutes = require("./message");
var userRoutes = require("./user");
var roomRoutes = require("./room");
function route(app) {
  app.use("/api/auth", authRoutes);

  app.use("/api/message", messageRoutes);

  app.use("/api/user", userRoutes);

  app.use("/api/room", roomRoutes);
}
module.exports = route;
