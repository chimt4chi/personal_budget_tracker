// /groups/[id]/members.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const { id: group_id } = req.query;
  const userId = req.user?.id;

  if (req.method === "POST") {
    try {
      const { target_user_id, role } = req.body;
      const memberId = target_user_id || userId;

      await pool.query(
        "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)",
        [group_id, memberId, role || "member"]
      );

      return res.status(201).json({ message: "Member added" });
    } catch (err) {
      console.error("Error adding member:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, gm.role
         FROM group_members gm 
         JOIN users u ON gm.user_id = u.id 
         WHERE gm.group_id=?`,
        [group_id]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching members:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { target_user_id, new_role } = req.body;

      const [roles] = await pool.query(
        "SELECT role FROM group_members WHERE group_id=? AND user_id=?",
        [group_id, userId]
      );
      if (roles.length === 0 || roles[0].role !== "admin") {
        return res.status(403).json({ error: "Only admin can update roles" });
      }

      await pool.query(
        "UPDATE group_members SET role=? WHERE group_id=? AND user_id=?",
        [new_role, group_id, target_user_id]
      );

      return res.status(200).json({ message: "Member role updated" });
    } catch (err) {
      console.error("Error updating member role:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { target_user_id } = req.body;

      const [roles] = await pool.query(
        "SELECT role FROM group_members WHERE group_id=? AND user_id=?",
        [group_id, userId]
      );
      if (roles.length === 0 || roles[0].role !== "admin") {
        return res.status(403).json({ error: "Only admin can remove members" });
      }

      await pool.query(
        "DELETE FROM group_members WHERE group_id=? AND user_id=?",
        [group_id, target_user_id]
      );

      return res.status(200).json({ message: "Member removed" });
    } catch (err) {
      console.error("Error removing member:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
