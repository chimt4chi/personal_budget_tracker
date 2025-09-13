// /groups/[id]/settlements.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  // ✅ Normalize group_id (Next.js gives string | string[])
  const group_id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const userId = req.user?.id;

  if (!group_id) {
    return res.status(400).json({ error: "Missing group ID" });
  }

  if (req.method === "POST") {
    try {
      const { from_user_id, to_user_id, amount, notes } = req.body;

      if (!from_user_id || !to_user_id || !amount) {
        return res
          .status(400)
          .json({ error: "from_user_id, to_user_id and amount are required" });
      }

      console.log("Creating settlement:", {
        group_id,
        from_user_id,
        to_user_id,
        amount,
        notes,
      });

      await pool.query(
        `INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [group_id, from_user_id, to_user_id, amount, notes || null]
      );

      return res.status(201).json({ message: "Settlement recorded" });
    } catch (err) {
      console.error("Error adding settlement:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, fu.name AS from_user, tu.name AS to_user
         FROM settlements s
         JOIN users fu ON s.from_user_id = fu.id
         JOIN users tu ON s.to_user_id = tu.id
         WHERE s.group_id=?`,
        [group_id]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching settlements:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { settlement_id, new_amount, new_notes } = req.body;

      if (!settlement_id || !new_amount) {
        return res
          .status(400)
          .json({ error: "settlement_id and new_amount are required" });
      }

      const [rows] = await pool.query(
        "SELECT from_user_id FROM settlements WHERE id=?",
        [settlement_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Settlement not found" });
      if (rows[0].from_user_id !== userId) {
        return res
          .status(403)
          .json({ error: "Only creator can update settlement" });
      }

      await pool.query("UPDATE settlements SET amount=?, notes=? WHERE id=?", [
        new_amount,
        new_notes || null,
        settlement_id,
      ]);

      return res.status(200).json({ message: "Settlement updated" });
    } catch (err) {
      console.error("Error updating settlement:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { settlement_id } = req.body;

      if (!settlement_id) {
        return res.status(400).json({ error: "settlement_id is required" });
      }

      const [rows] = await pool.query(
        "SELECT from_user_id FROM settlements WHERE id=?",
        [settlement_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Settlement not found" });
      if (rows[0].from_user_id !== userId) {
        return res
          .status(403)
          .json({ error: "Only creator can delete settlement" });
      }

      await pool.query("DELETE FROM settlements WHERE id=?", [settlement_id]);
      return res.status(200).json({ message: "Settlement deleted" });
    } catch (err) {
      console.error("Error deleting settlement:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
