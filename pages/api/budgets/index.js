// pages/api/budgets/index.js
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(`
        SELECT 
          b.id,
          b.user_id,
          u.name AS user_name,
          b.category_id,
          c.name AS category_name,
          b.period_month,
          b.limit_amount,
          b.carryover_policy,
          b.created_at,
          b.updated_at
        FROM budgets b
        JOIN users u ON b.user_id = u.id
        JOIN categories c ON b.category_id = c.id
        ORDER BY b.period_month DESC
      `);

      res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      res.status(500).json({ error: "Error fetching budgets" });
    }
  }

  if (req.method === "POST") {
    try {
      let {
        user_id,
        category_id,
        period_month,
        limit_amount,
        carryover_policy,
      } = req.body;

      // Fix period_month: add `-01` if only year-month is provided
      if (period_month.length === 7) {
        period_month = `${period_month}-01`;
      }

      const [result] = await pool.query(
        `INSERT INTO budgets
        (user_id, category_id, period_month, limit_amount, carryover_policy)
       VALUES (?, ?, ?, ?, ?)`,
        [user_id, category_id, period_month, limit_amount, carryover_policy]
      );

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error("Error creating budget:", err);
      res.status(500).json({ error: "Failed to create budget" });
    }
  }

  if (req.method === "PUT") {
    try {
      let {
        user_id,
        category_id,
        period_month,
        limit_amount,
        carryover_policy,
      } = req.body;

      if (period_month.length === 7) {
        period_month = `${period_month}-01`;
      }

      await pool.query(
        `UPDATE budgets
         SET user_id = ?, category_id = ?, period_month = ?, limit_amount = ?, carryover_policy = ?
       WHERE id = ?`,
        [
          user_id,
          category_id,
          period_month,
          limit_amount,
          carryover_policy,
          req.query.id,
        ]
      );

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Error updating budget:", err);
      res.status(500).json({ error: "Failed to update budget" });
    }
  }
}
