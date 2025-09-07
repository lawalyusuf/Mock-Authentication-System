const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // generate UUID
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passcodeHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    failedLoginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastFailedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { sequelize, modelName: "User" }
);

module.exports = User;
