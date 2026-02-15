import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, kind } = req.body;
      if (!name || !kind)
        return res.status(400).json({ error: "Missing fields" });

      const [result] = await pool.query(
        "INSERT INTO categories (name, kind) VALUES (?, ?)",
        [name, kind],
      );
      return res
        .status(201)
        .json({ id: result.insertId, message: "Category created" });
    } catch (err) {
      console.error("Error creating category:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      // const [rows] = await pool.query("SELECT * FROM categories");
      const [rows] = await pool.query("SELECT id, name FROM categories");
      return res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
