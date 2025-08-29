// pages/api/budgets/index.js
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { user_id, category_id, period_month, limit_amount } = req.body;

      const [result] = await pool.query(
        `INSERT INTO budgets (user_id, category_id, period_month, limit_amount)
         VALUES (?, ?, ?, ?)`,
        [user_id, category_id, period_month, limit_amount]
      );

      return res
        .status(201)
        .json({ id: result.insertId, message: "Budget created" });
    } catch (err) {
      console.error("Error inserting budget:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      const { user_id, period_month } = req.query;
      const [rows] = await pool.query(
        `SELECT * FROM budgets WHERE user_id = ? AND period_month = ?`,
        [user_id, period_month]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
