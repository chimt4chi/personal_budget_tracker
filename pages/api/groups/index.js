// /api/groups/index.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const userId = req.user?.id;

  if (req.method === "POST") {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Missing group name" });

      const [result] = await pool.query(
        "INSERT INTO user_groups (name, created_by) VALUES (?, ?)",
        [name, userId]
      );
      const groupId = result.insertId;

      await pool.query(
        "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')",
        [groupId, userId]
      );

      return res.status(201).json({ id: groupId, group_name: name });
    } catch (err) {
      console.error("Error creating group:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        `SELECT g.id, g.name AS group_name, u.name AS owner_name, u.id AS owner_id
       FROM user_groups g
       JOIN users u ON g.created_by = u.id
       WHERE g.created_by = ?
          OR g.id IN (
            SELECT gm.group_id 
            FROM group_members gm 
            WHERE gm.user_id = ?
          )
       GROUP BY g.id, g.name, u.name, u.id`,
        [userId, userId]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { group_id, new_name } = req.body;
      if (!group_id || !new_name) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const [rows] = await pool.query(
        "SELECT created_by FROM user_groups WHERE id=?",
        [group_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Group not found" });
      if (rows[0].created_by !== userId) {
        return res.status(403).json({ error: "Only owner can rename group" });
      }

      await pool.query("UPDATE user_groups SET name=? WHERE id=?", [
        new_name,
        group_id,
      ]);
      return res.status(200).json({ message: "Group renamed" });
    } catch (err) {
      console.error("Error updating group:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { group_id } = req.body;

      const [rows] = await pool.query(
        "SELECT created_by FROM user_groups WHERE id=?",
        [group_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Group not found" });
      if (rows[0].created_by !== userId) {
        return res
          .status(403)
          .json({ error: "Only group owner can delete the group" });
      }

      await pool.query("DELETE FROM user_groups WHERE id=?", [group_id]);
      return res.status(200).json({ message: "Group deleted" });
    } catch (err) {
      console.error("Error deleting group:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
