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

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: The message managing API
 */

/**
 * @swagger
 * /message/{id}:
 *   get:
 *     summary: Get all messages between two users
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the user
 *     responses:
 *       200:
 *         description: The messages between two users
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
 *                       sender:
 *                         type: string
 *                         example: "60f9a3e0b4c7b00015b5b7e3"
 *                       receiver:
 *                         type: string
 *                         example: "60f9a3e0b4c7b00015b5b7e3"
 *                       message:
 *                         type: string
 *                         example: "Hello"
 *                       createdAt:
 *                         type: string
 *                         example: "2021-07-23T06:29:04.000Z"
 *                       updatedAt:
 *                         type: string
 *                         example: "2021-07-23T06:29:04.000Z"
 *                 onSuccess:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/:id", protectRoute, getMessages);

/**
 * @swagger
 * /message/send/{id}:
 *   post:
 *     summary: Send a message to a user
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *             example:
 *               message: "Hello"
 *     responses:
 *       200:
 *         description: Successfully sent a message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f9a3e0b4c7b00015b5b7e3"
 *                     sender:
 *                       type: string
 *                       example: "60f9a3e0b4c7b00015b5b7e3"
 *                     receiver:
 *                       type: string
 *                       example: "60f9a3e0b4c7b00015b5b7e3"
 *                     message:
 *                       type: string
 *                       example: "Hello"
 *                     createdAt:
 *                       type: string
 *                       example: "2021-07-23T06:29:04.000Z"
 *                     updatedAt:
 *                       type: string
 *                       example: "2021-07-23T06:29:04.000Z"
 *                 onSuccess:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post("/send/:id", protectRoute, sendMessage);

module.exports = router;
