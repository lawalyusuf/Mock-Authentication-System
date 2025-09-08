const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;

// Send OTP via WhatsApp using Twilio
async function sendOTP(destination, otp) {
  if (TWILIO_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
    const client = require("twilio")(TWILIO_SID, TWILIO_AUTH_TOKEN);

    try {
      await client.messages.create({
        body: `Your SAS OTP: ${otp} (expires in 5 minutes)`,
        from: TWILIO_WHATSAPP_FROM,
        to: destination, // Ex: 'whatsapp:+2347035579326'
      });

      logger.info({ action: "otp_sent", channel: "whatsapp", destination });
      return true;
    } catch (err) {
      logger.error({ action: "otp_failed", destination, error: err.message });
      throw new Error("Failed to send OTP via WhatsApp");
    }
  } else {
    // Fallback: log OTP for testing if Twilio not configured
    logger.info({
      action: "otp_mock",
      destination,
      otp,
      note: "Twilio not configured", //for deburging
    });
    return true;
  }
}

// Hash OTP securely before storing
async function hashOTP(plainOtp) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return bcrypt.hash(plainOtp, saltRounds);
}

// Verify OTP hash
async function verifyOTPHash(plainOtp, hash) {
  return bcrypt.compare(plainOtp, hash);
}

module.exports = {
  sendOTP,
  hashOTP,
  verifyOTPHash,
};
