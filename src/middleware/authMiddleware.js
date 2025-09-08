const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // User info
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

function authorize(roles = []) {
  // Authorize User/Admin
  return async (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    if (roles.length === 0) return next();
    if (!roles.includes(req.user.role))
      return res
        .status(403)
        .json({ message: "Forbidden - insufficient permissions" });
    next();
  };
}

module.exports = { authenticate, authorize };
