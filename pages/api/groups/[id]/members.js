// /groups/[id]/members.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const { id: group_id } = req.query;
  const userId = req.user?.id;

  if (req.method === "POST") {
    const { target_user_id, target_user_email } = req.body;

    let userIdToAdd = target_user_id;

    if (!userIdToAdd && target_user_email) {
      const [rows] = await pool.query("SELECT id FROM users WHERE email=?", [
        target_user_email,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userIdToAdd = rows[0].id;
    }

    if (!userIdToAdd) {
      return res.status(400).json({ error: "Missing user info" });
    }

    // prevent duplicate membership
    await pool.query(
      `INSERT IGNORE INTO group_members (group_id, user_id, role) 
     VALUES (?, ?, 'member')`,
      [group_id, userIdToAdd]
    );

    return res.status(201).json({ message: "Member added" });
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
      const { member_id } = req.body;

      if (!member_id) {
        return res.status(400).json({ error: "Missing member_id" });
      }

      // Prevent owner from being removed
      const [ownerCheck] = await pool.query(
        "SELECT created_by FROM user_groups WHERE id=?",
        [group_id]
      );
      if (ownerCheck.length && ownerCheck[0].created_by === member_id) {
        return res.status(403).json({ error: "Owner cannot be removed" });
      }

      await pool.query(
        "DELETE FROM group_members WHERE group_id=? AND user_id=?",
        [group_id, member_id]
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
