const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const OTP = require("../models/OTP");
const RefreshToken = require("../models/RefreshToken");
const logger = require("../utils/logger");
const notification = require("./notification.service");

// Load env
const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refreshsecret";
const ACCESS_EXP = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");

async function register({
  username,
  dob,
  referralCode,
  passcode,
  channel,
  destination,
  role = "user",
  ip,
}) {
  // Sanity checks handled by controller
  const existing = await User.findOne({ where: { username } });
  if (existing) throw new Error("Username already exists");

  // Hash passcode
  const passcodeHash = await bcrypt.hash(passcode, BCRYPT_SALT_ROUNDS);

  // Create user
  const user = await User.create({
    username,
    dob,
    referralCode,
    passcodeHash,
    role,
  });

  // Issue OTP to verify, generate OTP and store hashed.
  const otpPlain = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpHash = await notification.hashOTP(otpPlain);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.create({
    userId: user.id,
    otpHash,
    channel,
    expiresAt,
  });

  // Send via notification service (mockable)
  await notification.sendOTP(channel, destination, otpPlain);

  logger.info({ action: "register", userId: user.id, ip, channel });
  return user;
}

function generateAccessToken(user) {
  // jti (token id) for revocation
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    jti: uuidv4(),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXP });
}

function generateRefreshToken(user) {
  const token = uuidv4(); // Store refresh tokens as UUIDs in DB
  // Store in DB to allow revocation
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
  return RefreshToken.create({
    userId: user.id,
    token,
    expiresAt,
  }).then((rt) => ({ token, expiresAt }));
}

async function login({ username, passcode, ip }) {
  const user = await User.findOne({ where: { username } });
  logger.info({
    action: "login_attempt",
    username,
    ip,
    ts: new Date().toISOString(),
  });
  if (!user) {
    logger.info({ action: "login_failed", username, ip, reason: "not_found" });
    throw new Error("Invalid credentials");
  }
  if (user.isLocked) {
    throw new Error("Account locked due to repeated failed attempts");
  }
  const ok = await bcrypt.compare(passcode, user.passcodeHash);
  if (!ok) {
    // Increment failed counter
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;
    user.lastFailedAt = new Date();
    await user.save();

    logger.info({
      action: "login_failed",
      userId: user.id,
      username,
      ip,
      attempts: user.failedLoginCount,
    });

    throw new Error("Invalid credentials");
  }

  // Reset failed counters on success
  user.failedLoginCount = 0;
  user.lastFailedAt = null;
  await user.save();

  const accessToken = generateAccessToken(user);
  const refresh = await generateRefreshToken(user);

  logger.info({ action: "login_success", userId: user.id, username, ip });
  return { accessToken, refreshToken: refresh.token };
}

async function logout(userId, refreshToken) {
  // Revoke refresh token
  const rt = await RefreshToken.findOne({
    where: { token: refreshToken, userId },
  });
  if (rt) {
    rt.revoked = true;
    await rt.save();
  }
  // Access token (jti) to a blacklist store
  logger.info({ action: "logout", userId });
}

async function requestOTP(userId, channel, destination) {
  // Limit OTP requests with per-user rate limits handle by controller/middleware
  const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await notification.hashOTP(otpPlain);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OTP.create({
    userId,
    otpHash,
    channel,
    expiresAt,
  });
  await notification.sendOTP(channel, destination, otpPlain);
  logger.info({ action: "otp_issued", userId, channel });
  return true;
}

async function validateOTP(userId, otpPlain) {
  const record = await OTP.findOne({
    where: { userId, used: false },
    order: [["createdAt", "DESC"]],
  });
  if (!record) throw new Error("No OTP found");

  if (record.expiresAt < new Date()) {
    record.used = true;
    await record.save();
    logger.info({ action: "otp_expired", userId });
    throw new Error("OTP expired");
  }

  // Prevent brute force: increment attempts
  record.attempts += 1;
  await record.save();
  if (record.attempts > 5) {
    // too many attempts - mark used and block further attempts
    record.used = true;
    await record.save();
    logger.warn({ action: "otp_attempts_exceeded", userId });
    throw new Error("Too many OTP attempts");
  }

  const ok = await notification.verifyOTPHash(otpPlain, record.otpHash);
  if (!ok) {
    logger.info({ action: "otp_invalid", userId });
    throw new Error("Invalid OTP");
  }

  record.used = true;
  await record.save();

  logger.info({ action: "otp_validated", userId });
  return true;
}

module.exports = {
  register,
  login,
  logout,
  requestOTP,
  validateOTP,
  generateAccessToken,
  generateRefreshToken,
};
