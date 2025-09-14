// /pages/api/groups/leave.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { group_id } = req.body;
  const userId = req.user?.id;

  if (!group_id || !userId) {
    return res.status(400).json({ error: "Missing group_id or user" });
  }

  try {
    // Check if the user is part of this group
    const [membership] = await pool.query(
      "SELECT role FROM group_members WHERE group_id=? AND user_id=?",
      [group_id, userId]
    );
    if (membership.length === 0) {
      return res
        .status(404)
        .json({ error: "You are not a member of this group" });
    }

    // Prevent the group creator from leaving (owner)
    const [group] = await pool.query(
      "SELECT created_by FROM user_groups WHERE id=?",
      [group_id]
    );
    if (group.length && group[0].created_by === userId) {
      return res.status(403).json({
        error: "Group owner cannot leave. You must delete the group instead.",
      });
    }

    // Remove membership
    await pool.query(
      "DELETE FROM group_members WHERE group_id=? AND user_id=?",
      [group_id, userId]
    );

    return res
      .status(200)
      .json({ message: "You have left the group successfully" });
  } catch (err) {
    console.error("Error leaving group:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default requireAuth(handler);
