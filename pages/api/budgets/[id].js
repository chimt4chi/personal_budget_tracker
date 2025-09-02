// pages/api/budgets/[id].js
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      let {
        user_id,
        category_id,
        period_month,
        limit_amount,
        carryover_policy,
      } = req.body;

      // Ensure period_month is YYYY-MM-DD
      if (period_month && period_month.length === 7) {
        period_month = `${period_month}-01`;
      }

      await pool.query(
        `UPDATE budgets
         SET user_id=?, category_id=?, period_month=?, limit_amount=?, carryover_policy=?
         WHERE id=?`,
        [user_id, category_id, period_month, limit_amount, carryover_policy, id]
      );

      return res.status(200).json({ success: true, message: "Budget updated" });
    } catch (err) {
      console.error("Error updating budget:", err);
      return res.status(500).json({ error: "Failed to update budget" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query(`DELETE FROM budgets WHERE id=?`, [id]);
      return res.status(200).json({ success: true, message: "Budget deleted" });
    } catch (err) {
      console.error("Error deleting budget:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        `SELECT b.*, c.name AS category, u.name AS user
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Budget not found" });
      }

      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error("Error fetching budget:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
