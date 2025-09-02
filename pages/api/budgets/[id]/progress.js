// pages/api/budgets/[id]/progress.js
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const [budgetRows] = await pool.query(
        `SELECT id, user_id, category_id, period_month, limit_amount 
         FROM budgets WHERE id=?`,
        [id]
      );

      if (budgetRows.length === 0) {
        return res.status(404).json({ error: "Budget not found" });
      }

      const budget = budgetRows[0];

      // Calculate spent amount
      const [spentRows] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS spent
         FROM transactions
         WHERE user_id=? 
           AND category_id=?
           AND DATE_FORMAT(txn_date, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')`,
        [budget.user_id, budget.category_id, budget.period_month]
      );

      const spent = spentRows[0].spent;
      const remaining = budget.limit_amount - spent;

      return res.status(200).json({
        ...budget,
        spent,
        remaining,
        status: spent > budget.limit_amount ? "over" : "within",
      });
    } catch (err) {
      console.error("Error fetching budget progress:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
