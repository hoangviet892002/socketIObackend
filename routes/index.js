var authRoutes = require("./auth");
var messageRoutes = require("./message");
var userRoutes = require("./user");

function route(app) {
  app.use("/api/auth", authRoutes);

  app.use("/api/message", messageRoutes);

  app.use("/api/user", userRoutes);
}
module.exports = route;
