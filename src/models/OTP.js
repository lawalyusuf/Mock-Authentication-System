const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class OTP extends Model {}

OTP.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    // Store hashed OTP
    otpHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    channel: {
      // 'telegram' |'whatsapp' | 'sms'
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize, modelName: "OTP" }
);

module.exports = OTP;
