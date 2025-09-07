const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class Log extends Model {}

Log.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ip: DataTypes.STRING,
    level: DataTypes.STRING,
    action: DataTypes.STRING,
    details: DataTypes.JSON,
  },
  { sequelize, modelName: "Log" }
);

module.exports = Log;
