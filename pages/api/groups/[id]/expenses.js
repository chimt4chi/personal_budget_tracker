// /groups/[id]/expenses.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const { id: group_id } = req.query;
  const userId = req.user?.id;

  if (req.method === "POST") {
    try {
      const {
        paid_by,
        category_id,
        amount,
        description,
        split_type,
        split_details,
      } = req.body;

      const [result] = await pool.query(
        `INSERT INTO group_expenses 
         (group_id, created_by, paid_by, category_id, amount, description, split_type, txn_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [
          group_id,
          userId,
          paid_by,
          category_id || null,
          amount,
          description || null,
          split_type || "equal",
        ]
      );
      const expenseId = result.insertId;

      if (Array.isArray(split_details)) {
        for (const split of split_details) {
          await pool.query(
            `INSERT INTO group_expense_splits 
             (group_expense_id, user_id, share_amount, percentage, shares) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              expenseId,
              split.user_id,
              split.share_amount,
              split.percentage || null,
              split.shares || null,
            ]
          );
        }
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
        `SELECT ge.*, u.name AS paid_by_name
         FROM group_expenses ge
         JOIN users u ON ge.paid_by = u.id
         WHERE ge.group_id=?`,
        [group_id]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { expense_id, amount, description } = req.body;

      const [rows] = await pool.query(
        "SELECT created_by FROM group_expenses WHERE id=?",
        [expense_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Expense not found" });
      if (rows[0].created_by !== userId) {
        return res
          .status(403)
          .json({ error: "Only creator can update expense" });
      }

      await pool.query(
        "UPDATE group_expenses SET amount=?, description=? WHERE id=?",
        [amount, description, expense_id]
      );

      return res.status(200).json({ message: "Expense updated" });
    } catch (err) {
      console.error("Error updating expense:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { expense_id } = req.body;

      const [rows] = await pool.query(
        "SELECT created_by FROM group_expenses WHERE id=?",
        [expense_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Expense not found" });
      if (rows[0].created_by !== userId) {
        return res
          .status(403)
          .json({ error: "Only creator can delete expense" });
      }

      await pool.query("DELETE FROM group_expenses WHERE id=?", [expense_id]);
      return res.status(200).json({ message: "Expense deleted" });
    } catch (err) {
      console.error("Error deleting expense:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
