const express = require("express");
const { body } = require("express-validator");
const controller = require("../controllers/auth.controller");
const { perUserLoginLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Register route
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).trim().escape(),
    body("dob").isISO8601(),
    body("passcode")
      .isLength({ min: 6 })
      .withMessage("passcode at least 6 chars"),
  ],
  controller.register
);

// Login route with per-user rate limiter
router.post(
  "/login",
  [body("username").exists().trim().escape(), body("passcode").exists()],
  perUserLoginLimiter,
  controller.login
);

// OTP endpoints
router.post("/otp/request", controller.requestOTP);
router.post("/otp/validate", controller.validateOTP);

// Refresh and logout
router.post("/refresh", controller.refreshToken);
router.post("/logout", controller.logout);

module.exports = router;
