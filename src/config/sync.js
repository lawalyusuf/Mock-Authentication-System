const sequelize = require("./db");
const User = require("../models/User");
const OTP = require("../models/OTP");
const RefreshToken = require("../models/RefreshToken");
const Log = require("../models/Log");

// Sync models
async function syncAll() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced"); //deburg
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

syncAll();
