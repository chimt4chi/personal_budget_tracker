import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const userId = req.user?.id;
  if (req.method === "GET") {
    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId query parameter is required" });
    }

    try {
      const [rows] = await pool.query(
        `SELECT g.id, g.name, u.name AS owner_name, g.created_by
         FROM user_groups g
         JOIN users u ON g.created_by = u.id
         JOIN group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = ?`,
        [userId]
      );

      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching user groups:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default requireAuth(handler);
