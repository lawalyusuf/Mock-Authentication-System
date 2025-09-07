require("dotenv").config();
const path = require("path");

module.exports = {
  development: {
    dialect: "sqlite",
    storage: path.resolve(__dirname, "../../database.sqlite"),
    logging: console.log, // Logs SQL queries for deburg
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
  production: {
    // For other db details in env for prod
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
};
