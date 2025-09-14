// pages/api/test.js
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now_time");

    res.status(200).json({ success: true, time: rows[0].current_time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
