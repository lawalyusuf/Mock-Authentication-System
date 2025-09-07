const { createLogger, format, transports } = require("winston");
const path = require("path");

// Logs JSON lines to logs/activity.log
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "../../logs/activity.log"),
    }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
