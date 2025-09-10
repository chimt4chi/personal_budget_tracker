import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const { id: group_id } = req.query;
  const userId = req.user?.id;

  if (req.method === "POST") {
    try {
      // Add the authenticated user as member by default
      await pool.query(
        "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)",
        [group_id, userId, req.body.role || "member"]
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
        "SELECT u.id, u.name, u.email FROM group_members gm JOIN users u ON gm.user_id=u.id WHERE gm.group_id=?",
        [group_id]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching members:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
