// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../lib/db");
const { jwtSecret } = require("../middleware/auth");

const SALT_ROUNDS = 10;

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      currency_code = "INR",
      time_zone = "Asia/Kolkata",
    } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name,email,password required" });

    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (exists.length)
      return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, currency_code, time_zone) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hash, currency_code, time_zone]
    );
    const userId = result.insertId;
    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
    res.status(201).json({ user: { id: userId, name, email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email,password required" });

    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash || "");
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { register, login };
