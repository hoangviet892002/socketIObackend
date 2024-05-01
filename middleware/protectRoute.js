const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protectRoute = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized: No valid token provided" });
  } else {
    const token = authorizationHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized: Token expired or invalid. Please login again.",
      });
    }
  }
};

module.exports = protectRoute;
