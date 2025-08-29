import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    try {
      const { name, email } = req.body;
      await pool.query("UPDATE users SET name=?, email=? WHERE id=?", [
        name,
        email,
        id,
      ]);
      return res.status(200).json({ message: "User updated" });
    } catch (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM users WHERE id=?", [id]);
      return res.status(200).json({ message: "User deleted" });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
