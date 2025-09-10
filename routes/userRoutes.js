const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// User Signup
router.post("/signup", authController.signup);

// User Login
router.post("/login", authController.login);

module.exports = router;
