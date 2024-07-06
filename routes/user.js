const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const { getUsers } = require("../controllers/user.controller.js");

var router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Message
 *   description: The message managing API
 */
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The search string
 *         example: "John"
 *     responses:
 *       200:
 *         description: The users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f9a3e0b4c7b00015b5b7e3"
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       username:
 *                         type: string
 *                         example: "johndoe"
 *                       profilePic:
 *                         type: string
 *                         example: "https://example.com/profile.jpg"
 */

router.get("/", protectRoute, getUsers);

module.exports = router;
