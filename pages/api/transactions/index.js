import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // const [rows] = await pool.query("SELECT * FROM transactions");
      const [rows] = await pool.query(`
        SELECT t.id, t.amount, t.description, c.name AS category, t.txn_type, t.txn_date, t.updated_at, g.name AS group_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN user_groups g ON t.group_id = g.id
        ORDER BY t.txn_date DESC
      `);
      return res.status(200).json(rows);
    } catch (err) {
      console.error("MySQL error:", err);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
  }

  if (req.method === "POST") {
    const {
      user_id,
      category_id,
      txn_type,
      amount,
      description,
      txn_date,
      group_id,
      notes,
    } = req.body;

    if (!user_id || !category_id || !txn_type || !amount || !txn_date) {
      return res.status(400).json({
        error:
          "user_id, category_id, txn_type, amount, and txn_date are required",
      });
    }

    try {
      await pool.query(
        // `INSERT INTO transactions
        //   (user_id, category_id, txn_type, amount, txn_date, notes)
        //  VALUES (?, ?, ?, ?, ?, ?)`,
        // [user_id, category_id, txn_type, amount, txn_date, notes || null]
        `INSERT INTO transactions (user_id, amount, description, category_id, txn_type, txn_date, group_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          amount,
          description && description.trim() !== ""
            ? description
            : "No description",
          category_id,
          txn_type,
          txn_date,
          group_id || null,
        ]
      );

      return res
        .status(201)
        .json({ message: "Transaction created successfully" });
    } catch (err) {
      console.error("MySQL error:", err);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
