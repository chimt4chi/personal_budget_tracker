// pages/api/budgets/index.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  if (req.method === "GET") {
    const [rows] = await pool.query(
      `SELECT b.*, c.name AS category_name
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.period_month DESC`,
      [req.user.id]
    );
    return res.json(rows);
  }

  if (req.method === "POST") {
    const { category_id, period_month, limit_amount, carryover_policy } =
      req.body;
    const [result] = await pool.query(
      `INSERT INTO budgets (user_id, category_id, period_month, limit_amount, carryover_policy)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        category_id,
        period_month + "-01",
        limit_amount,
        carryover_policy,
      ]
    );
    return res.status(201).json({ id: result.insertId });
  }

  res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
