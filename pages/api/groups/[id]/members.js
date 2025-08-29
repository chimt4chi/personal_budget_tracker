import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "POST") {
    try {
      const { user_id } = req.body;
      await pool.query(
        "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
        [id, user_id]
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
        [id]
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
