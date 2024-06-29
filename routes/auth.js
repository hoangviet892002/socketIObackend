var express = require("express");
var router = express.Router();
const {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/auth.controller");
const protectRoute = require("../middleware/protectRoute");
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fullName
 *         - username
 *         - password
 *         - confirmPassword
 *         - gender
 *       properties:
 *         fullName:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 *         gender:
 *           type: string
 *       example:
 *         fullName: John Doe
 *         username: johndoe
 *         password: password123
 *         confirmPassword: password123
 *         gender: male
 */
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The authentication managing API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successfully signed up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     username:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                 onSuccess:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/signup", signup);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The authentication managing API
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               username: johndoe
 *               password: password123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     username:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                     token:
 *                       type: string
 *                 onSuccess:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: The user profile
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
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     profilePic:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 */

router.get("/profile", protectRoute, getProfile);

/**
 * @swagger
 * /auth/update-profile:
 *   post:
 *     summary: Update user profile
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               profilePic:
 *                 type: string
 *               gender:
 *                 type: string
 *             required:
 *               - fullName
 *               - profilePic
 *               - gender
 *     responses:
 *       '200':
 *         description: Update success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     username:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                     onSuccess:
 *                       type: boolean
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

router.post("/update-profile", protectRoute, updateProfile);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             example:
 *               oldPassword: password123
 *               newPassword: newpassword123
 *               confirmPassword: newpassword123
 *     responses:
 *       '200':
 *         description: Change password success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     username:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                     onSuccess:
 *                       type: boolean
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

router.post("/change-password", protectRoute, changePassword);
router.post("/logout", logout);

module.exports = router;
