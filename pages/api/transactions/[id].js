// // pages/api/transactions/[id].js
// import { pool } from "@/lib/db";

// export default async function handler(req, res) {
//   const { id } = req.query;

//   if (req.method === "PATCH") {
//     try {
//       const { amount, category_id, txn_type, txn_date, notes } = req.body;

//       const [result] = await pool.query(
//         `UPDATE transactions
//          SET amount = ?, category_id = ?, txn_type = ?, txn_date = ?, notes = ?
//          WHERE id = ?`,
//         [amount, category_id, txn_type, txn_date, notes || null, id]
//       );

//       return res.status(200).json({ message: "Transaction updated" });
//     } catch (err) {
//       console.error("Error updating transaction:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   }

//   if (req.method === "DELETE") {
//     try {
//       await pool.query("DELETE FROM transactions WHERE id = ?", [id]);
//       return res.status(200).json({ message: "Transaction deleted" });
//     } catch (err) {
//       console.error("Error deleting transaction:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   }

//   res.setHeader("Allow", ["PATCH", "DELETE"]);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/transactions/[id].js
// pages/api/transactions/[id].js
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const {
        user_id,
        amount,
        description,
        category_id,
        txn_type,
        txn_date,
        group_id,
      } = req.body;

      if (!user_id || !amount || !txn_type || !txn_date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await pool.query(
        `UPDATE transactions
         SET user_id=?, amount=?, description=?, category_id=?, txn_type=?, txn_date=?, group_id=?
         WHERE id=?`,
        [
          user_id, // must exist
          amount, // must exist
          description || "", // default to empty string
          category_id || null, // optional
          txn_type, // must exist
          txn_date, // must exist
          group_id || null, // optional
          id,
        ]
      );

      return res
        .status(200)
        .json({ success: true, message: "Transaction updated" });
    } catch (err) {
      console.error("Error updating transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query(`DELETE FROM transactions WHERE id=?`, [id]);
      return res
        .status(200)
        .json({ success: true, message: "Transaction deleted" });
    } catch (err) {
      console.error("Error deleting transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
