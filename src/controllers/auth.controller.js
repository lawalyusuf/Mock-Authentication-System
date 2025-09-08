const { body, validationResult } = require("express-validator");
const authService = require("../services/auth.service");
const logger = require("../utils/logger");
const {
  perUserLoginLimiter,
  incrementUserAttempt,
  resetUserAttempts,
} = require("../middleware/rateLimiter");
const challengeService = require("../services/challenge.service");
const User = require("../models/User");

// async function register(req, res) {
//   // Validation is done via express-validator
//   try {
//     const { username, dob, referralCode, passcode, channel, destination } =
//       req.body;
//     const ip = req.ip;
//     const user = await authService.register({
//       username,
//       dob,
//       referralCode,
//       passcode,
//       channel,
//       destination,
//       ip,
//     });
//     return res.status(201).json({
//       message: "Registered. OTP sent",
//       user: { id: user.id, username: user.username },
//     });
//   } catch (err) {
//     logger.error({ action: "register_error", error: err.message });
//     return res.status(400).json({ message: err.message });
//   }
// }
async function register(req, res) {
  try {
    const { username, dob, referralCode, passcode, channel, destination } =
      req.body;

    // Defaults if not provided
    const sendChannel = channel || "whatsapp";
    const sendDestination = destination || "whatsapp:+2340000000000";

    const ip = req.ip;
    const user = await authService.register({
      username,
      dob,
      referralCode,
      passcode,
      channel: sendChannel,
      destination: sendDestination,
      ip,
    });

    return res.status(201).json({
      message: "Registered. OTP sent",
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    logger.error({ action: "register_error", error: err.message });
    return res.status(400).json({ message: err.message });
  }
}
async function login(req, res) {
  // Capture and validate
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { username, passcode, challengeAnswer } = req.body;
  const ip = req.ip;

  // If a challenge exists, verify it first
  const challengeCheck = challengeService.verifyChallenge(
    username,
    challengeAnswer
  );
  if (challengeCheck && !challengeCheck.ok) {
    // If a challenge exists but not satisfied, instruct client.
    // If no challenge exists, verifyChallenge returns {ok:false, reason:'no_challenge'}
    if (challengeCheck.reason !== "no_challenge") {
      return res.status(400).json({
        message: "Challenge required and not satisfied",
        reason: challengeCheck.reason,
      });
    }
  }

  try {
    const result = await authService.login({ username, passcode, ip });
    resetUserAttempts(username);
    return res.json({ message: "Logged in", tokens: result });
  } catch (err) {
    // On failed login increment per-user attempt
    const count = incrementUserAttempt(username);
    // After 3 failed attempts create a challenge
    if (count >= 3) {
      const q = challengeService.createChallenge(username);
      logger.warn({ action: "challenge_issued", username, ip });
      return res.status(429).json({
        message: "Too many failed attempts. Solve challenge.",
        challenge: q,
      });
    }
    return res.status(401).json({ message: err.message });
  }
}

// async function requestOTP(req, res) {
//   const { userId, channel, destination } = req.body;
//   try {
//     await authService.requestOTP(userId, channel, destination);
//     res.json({ message: "OTP issued" });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }
async function requestOTP(req, res) {
  const { userId, channel, destination } = req.body;
  try {
    const sendChannel = channel || "whatsapp";
    const sendDestination = destination || "whatsapp:+2340000000000";

    await authService.requestOTP(userId, sendChannel, sendDestination);
    res.json({ message: "OTP issued" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function validateOTP(req, res) {
  const { userId, otp } = req.body;
  try {
    await authService.validateOTP(userId, otp);
    res.json({ message: "OTP validated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  const userId = req.user.id;
  try {
    await authService.logout(userId, refreshToken);
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "refreshToken required" });
  // Find in DB and issue new access token
  const rt = await require("../models/RefreshToken").findOne({
    where: { token: refreshToken },
  });
  if (!rt || rt.revoked || rt.expiresAt < new Date()) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
  const user = await User.findByPk(rt.userId);
  if (!user) return res.status(401).json({ message: "User not found" });
  const newAccess = authService.generateAccessToken(user);
  res.json({ accessToken: newAccess });
}

module.exports = {
  register,
  login,
  requestOTP,
  validateOTP,
  logout,
  refreshToken,
};
