import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, email, password_hash } = req.body;
      if (!name || !email || !password_hash) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [result] = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        [name, email, password_hash]
      );

      return res
        .status(201)
        .json({ id: result.insertId, message: "User created" });
    } catch (err) {
      console.error("Error creating user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, email, created_at FROM users"
        // "SELECT id FROM users"
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
