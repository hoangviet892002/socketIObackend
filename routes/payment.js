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
 * /order/create/{package}:
 *   get:
 *     summary: Create a payment
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: package
 *         required: true
 *         schema:
 *           type: string
 *         description: The package type
 *     responses:
 *       200:
 *         description: The payment
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
 *                     package:
 *                       type: string
 *                       example: "Basic"
 *                     price:
 *                       type: number
 *                       example: 100000
 *                     orderId:
 *                       type: string
 *                       example: "60f9a3e0b4c7b00015b5b7e3"
 */

router.get("/create/:package", protectRoute, create_payment);

/**
 * @swagger
 * /order/return/{packageType}/{accId}:
 *   get:
 *     summary: Return from VNPAY
 *     tags:
 *       - Payment
 *     parameters:
 *       - in: path
 *         name: packageType
 *         required: true
 *         schema:
 *           type: string
 *         description: The package type
 *       - in: path
 *         name: accId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account id
 *     responses:
 *       200:
 *         description: The payment
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
 *                     package:
 *                       type: string
 *                       example: "Basic"
 *                     price:
 *                       type: number
 *                       example: 100000
 *                     orderId:
 *                       type: string
 *                       example: "60f9a3e0b4c7b00015b5b7e3"
 */

router.get("/return/:packageType/:accId", vnpay_return);

module.exports = router;
