import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { user_id, month, year } = req.query;

    if (!user_id || !month || !year) {
      return res.status(400).json({ error: "Missing user_id, month or year" });
    }

    // 🧮 1. Total Income & Expense
    const [incomeExpense] = await pool.query(
      `SELECT c.type, SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? 
       AND MONTH(t.date) = ? 
       AND YEAR(t.date) = ?
       GROUP BY c.type`,
      [user_id, month, year]
    );

    const income = incomeExpense.find((r) => r.type === "income")?.total || 0;
    const expense = incomeExpense.find((r) => r.type === "expense")?.total || 0;

    // 📂 2. Category Breakdown
    const [categoryBreakdown] = await pool.query(
      `SELECT c.name, SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       AND MONTH(t.date) = ?
       AND YEAR(t.date) = ?
       GROUP BY c.name`,
      [user_id, month, year]
    );

    // 📊 3. Budget Utilization
    const [budgetUsage] = await pool.query(
      `SELECT b.amount AS budget, IFNULL(SUM(t.amount), 0) AS spent
       FROM budgets b
       LEFT JOIN transactions t ON t.category_id = b.category_id
         AND t.user_id = b.user_id
         AND MONTH(t.date) = ?
         AND YEAR(t.date) = ?
       WHERE b.user_id = ?
       GROUP BY b.id`,
      [month, year, user_id]
    );

    return res.status(200).json({
      income,
      expense,
      balance: income - expense,
      categories: categoryBreakdown,
      budgets: budgetUsage,
    });
  } catch (err) {
    console.error("Error generating report:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
