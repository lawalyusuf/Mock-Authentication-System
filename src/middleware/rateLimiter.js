// In-memory map to track attempts per identifier.
// In production, to be replace with Redis for persistence across processes.

const rateLimitWindowMs = 60 * 60 * 1000; // 1 hour
const maxAttemptsPerWindow = 5;
const userAttempts = new Map(); // key -> {count, firstAttemptAt}

function perUserLoginLimiter(req, res, next) {
  const username = req.body.username || req.query.username;
  if (!username)
    return res
      .status(400)
      .json({ message: "username required for rate limiting" });

  const now = Date.now();
  const entry = userAttempts.get(username) || { count: 0, firstAttemptAt: now };
  if (now - entry.firstAttemptAt > rateLimitWindowMs) {
    // Reset window
    entry.count = 0;
    entry.firstAttemptAt = now;
  }
  if (entry.count >= maxAttemptsPerWindow) {
    // After 3 failed attempts require challenge-response (challenge service)
    return res.status(429).json({
      message: "Too many login attempts. Try again later or solve challenge.",
    });
  }
  // For login route, count increase only on failed attempts in controller,
  // but for this demo controller to increment DB-level failed counter.
  // and attach the entry to req for controller to use.
  userAttempts.set(username, entry);
  req._rateLimitEntry = entry;
  next();
}

// Utility to increment attempt called by controller when login fails
function incrementUserAttempt(username) {
  const now = Date.now();
  const entry = userAttempts.get(username) || { count: 0, firstAttemptAt: now };
  if (now - entry.firstAttemptAt > rateLimitWindowMs) {
    entry.count = 1;
    entry.firstAttemptAt = now;
  } else {
    entry.count += 1;
  }
  userAttempts.set(username, entry);
  return entry.count;
}

// Reset attempts after successful login
function resetUserAttempts(username) {
  userAttempts.delete(username);
}

module.exports = {
  perUserLoginLimiter,
  incrementUserAttempt,
  resetUserAttempts,
};
