import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, created_by } = req.body;
      if (!name || !created_by)
        return res.status(400).json({ error: "Missing fields" });

      const [result] = await pool.query(
        "INSERT INTO user_groups (name, created_by) VALUES (?, ?)",
        [name, created_by]
      );

      return res
        .status(201)
        .json({ id: result.insertId, message: "Group created" });
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
