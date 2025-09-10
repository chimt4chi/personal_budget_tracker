import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const userId = req.user?.id;

  if (req.method === "POST") {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing group name" });
      }

      // Insert group with creator as created_by
      const [result] = await pool.query(
        "INSERT INTO user_groups (name, created_by) VALUES (?, ?)",
        [name, userId]
      );

      const groupId = result.insertId;

      // Also insert creator as admin member
      await pool.query(
        "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)",
        [groupId, userId, "admin"]
      );

      return res.status(201).json({ id: groupId, message: "Group created" });
    } catch (err) {
      console.error("Error creating group:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      // const [rows] = await pool.query("SELECT * FROM user_groups");
      const [rows] = await pool.query("SELECT id, name FROM user_groups");
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

// select g.id, u.id as group_id, g.name as group_name, u.name as created_by from users u join user_groups g on u.id = g.created_by;

export default requireAuth(handler);
