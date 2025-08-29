import mysql from "mysql2/promise";

// export async function connectDB() {
//   const connection = await mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME,
//     port: process.env.DATABASE_PORT,
//   });
//   return connection;
// }
// export const pool = mysql.createPool({
//   host: process.env.DATABASE_HOST || "127.0.0.1",
//   user: process.env.DATABASE_USER || "root",
//   password: process.env.DATABASE_PASSWORD || "root",
//   database: process.env.DATABASE_NAME || "budget_tracker",
//   port: process.env.DATABASE_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   timezone: "+00:00", // store UTC; frontend can convert to user tz
// });

// module.exports = pool;

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
