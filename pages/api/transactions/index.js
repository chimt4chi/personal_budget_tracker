import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  if (req.method === "GET") {
    const [rows] = await pool.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY txn_date DESC",
      [req.user.id]
    );
    return res.json(rows);
  }

  if (req.method === "POST") {
    const { amount, description, category_id, txn_type, txn_date, group_id } =
      req.body;
    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, amount, description, category_id, txn_type, txn_date, group_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        amount,
        description,
        category_id,
        txn_type,
        txn_date,
        group_id || null,
      ]
    );
    return res.status(201).json({ id: result.insertId });
  }

  res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
