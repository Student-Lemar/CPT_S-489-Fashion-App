const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const COOKIE = "fashion_token";

/**
 * Attach req.user if a valid JWT cookie is present.
 * Sets req.user = { id, username, role, displayName, status }
 */
function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

/**
 * Require admin role (use after authenticate).
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
