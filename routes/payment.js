const express = require("express");
const protectRoute = require("../middleware/protectRoute.js");
const {
  create_payment,
  vnpay_return,
} = require("../controllers/order.controller.js");
var router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: The Payment managing API
 */

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create a payment
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               money:
 *                 type: integer
 *                 description: The amount of money you want to top up
 *                 example: 10000
 *     responses:
 *       '200':
 *         description: Payment success
 *       '400':
 *         description: Payment failed
 */

router.post("/", protectRoute, create_payment);

module.exports = router;
