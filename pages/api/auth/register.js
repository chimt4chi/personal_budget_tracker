import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      password,
      currency_code = "INR",
      time_zone = "Asia/Kolkata",
    } = req.body;

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, currency_code, time_zone, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name, email, password_hash, currency_code, time_zone]
    );

    return res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
