const express = require("express");
const fs = require("fs");
const path = require("path");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Admin route to fetch log file contents (read-only)
 * Only admin role can access this.
 */
router.get("/logs", authenticate, authorize(["admin"]), (req, res) => {
  const logPath = path.join(__dirname, "../../logs/activity.log");
  if (!fs.existsSync(logPath))
    return res.status(404).json({ message: "No logs yet" });
  const content = fs.readFileSync(logPath, "utf8");
  res.type("text/plain").send(content);
});

module.exports = router;
