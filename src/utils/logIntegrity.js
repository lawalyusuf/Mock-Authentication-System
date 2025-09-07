// Cron job within the app to compute a hash of the log file
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const LOG_PATH = path.join(__dirname, "../../logs/activity.log");
const HASH_RECORD = path.join(__dirname, "../../logs/hashes.log");

/**
 * Compute SHA-256 hash of current log file and append to a record file
 * This produces tamper-evidence: if activity.log changes, future hash will differ.
 */

async function hashLogs() {
  if (!fs.existsSync(LOG_PATH)) {
    console.warn("Log file not found yet");
    return;
  }
  const content = fs.readFileSync(LOG_PATH);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  const entry = JSON.stringify({ ts: new Date().toISOString(), hash });
  fs.appendFileSync(HASH_RECORD, entry + "\n");
  console.log("Wrote log hash:", entry);
}

// If executed directly via npm script
if (require.main === module) {
  hashLogs().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = hashLogs;
