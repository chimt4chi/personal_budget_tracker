// lib/middleware/auth.js
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";

export function requireAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    try {
      // Verify user still exists in database
      const [rows] = await pool.query(
        "SELECT id, email FROM users WHERE id = ?",
        [decoded.id] // ✅ Using 'id' not 'userId'
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }

      // Attach user info to request
      req.user = rows[0];

      return handler(req, res);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Authentication error" });
    }
  };
}
