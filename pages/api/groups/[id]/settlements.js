import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query; // group_id

  if (req.method === "POST") {
    try {
      const { paid_by, received_by, amount } = req.body;

      await pool.query(
        "INSERT INTO settlements (group_id, paid_by, received_by, amount) VALUES (?, ?, ?, ?)",
        [id, paid_by, received_by, amount]
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
        "SELECT * FROM settlements WHERE group_id=?",
        [id]
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching settlements:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
