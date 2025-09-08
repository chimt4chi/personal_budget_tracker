import mysql from "mysql2/promise";

let pool;

if (!global._pool) {
  global._pool = mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "budget_app",
    waitForConnections: true,
    connectionLimit: 10, // ✅ important: limit pool size
    queueLimit: 0,
  });
}

pool = global._pool;

export { pool };
