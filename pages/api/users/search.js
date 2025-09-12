// /api/users/search.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(200).json([]); // require at least 2 chars
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, name, email 
       FROM users 
       WHERE email LIKE ? OR name LIKE ? 
       LIMIT 10`,
      [`%${q}%`, `%${q}%`]
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default requireAuth(handler);
