import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query; // group_id

  if (req.method === "POST") {
    try {
      const { paid_by, amount, description, split_details } = req.body;

      const [result] = await pool.query(
        "INSERT INTO group_expenses (group_id, paid_by, amount, description) VALUES (?, ?, ?, ?)",
        [id, paid_by, amount, description]
      );

      const expenseId = result.insertId;

      // Insert splits
      for (const split of split_details) {
        await pool.query(
          "INSERT INTO group_expense_splits (expense_id, user_id, share_amount) VALUES (?, ?, ?)",
          [expenseId, split.user_id, split.share_amount]
        );
      }

      return res
        .status(201)
        .json({ id: expenseId, message: "Expense added with splits" });
    } catch (err) {
      console.error("Error adding expense:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM group_expenses WHERE group_id=?",
        [id]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
