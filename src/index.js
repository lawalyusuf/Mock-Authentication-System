require("dotenv").config();
require("express-async-errors"); // Simplifies error handling for async routes

const express = require("express"); //Express
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cron = require("node-cron"); //cron

const sequelize = require("./config/db");
const logger = require("./utils/logger");
const hashLogs = require("./utils/logIntegrity");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const setupSwagger = require("./docs/swagger");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
setupSwagger(app);

// Serve a simple static mock UI
app.use("/", express.static(path.join(__dirname, "../public")));

// Example error handler
app.use((err, req, res, next) => {
  logger.error({
    action: "uncaught_error",
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ message: "Internal Server Error" });
});

// Periodic log hashing for tamper detection
const cronExpr = process.env.LOG_HASH_CRON || "*/60 * * * *"; // default: every 60 minutes (cron expression)
cron.schedule(cronExpr, () => {
  logger.info({ action: "log_hashing_job_start" });
  hashLogs().catch((e) =>
    logger.error({ action: "log_hash_error", error: e.message })
  );
});

const PORT = process.env.PORT || 3000;
async function start() {
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`SAS server listening on ${PORT}`);
    logger.info({ action: "server_started", port: PORT });
  });
}

start().catch((err) => {
  logger.error({ action: "start_error", error: err.message });
  console.error(err);
  process.exit(1);
});
