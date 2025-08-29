// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const pool = require("../lib/db");

const jwtSecret = process.env.JWT_SECRET || "replace_this_secret"; // set env var in prod

async function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, jwtSecret);
    // Optionally verify user still exists/active
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [payload.userId]
    );
    if (!rows.length) return res.status(401).json({ error: "User not found" });
    req.user = rows[0];
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Invalid token", details: err.message });
  }
}

module.exports = { authRequired, jwtSecret };
