const { Sequelize } = require("sequelize");
const path = require("path");

// SQLite for demo
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../data/sas.sqlite"),
  logging: false,
});

module.exports = sequelize;
