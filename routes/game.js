const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const { getGame } = require("../controllers/game.controller.js");

var router = express.Router();

/**
 * @swagger
 * tags:
 *   name: History Game
 *   description: The History Game managing API
 */

/**
 * @swagger
 * /game:
 *   get:
 *     summary: Get all history game
 *     tags:
 *       - History Game
 *     responses:
 *       200:
 *         description: The history game
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
 *                       game:
 *                         type: string
 *                         example: "Tic Tac Toe"
 *                       result:
 *                         type: string
 *                         example: "Win"
 *                       time:
 *                         type: string
 *                         example: "2021-07-23T08:00:00.000Z"
 */

router.get("/", protectRoute, getGame);

module.exports = router;
