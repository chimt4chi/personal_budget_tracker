import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

let pool;

const isProd = process.env.VERCEL === "1"; // detect Vercel environment

const config = isProd
  ? {
      host: process.env.AIVEN_DB_HOST,
      user: process.env.AIVEN_DB_USER,
      password: process.env.AIVEN_DB_PASSWORD,
      database: process.env.AIVEN_DB_NAME,
      port: Number(process.env.AIVEN_DB_PORT),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        ca: fs.readFileSync(
          path.join(process.cwd(), process.env.AIVEN_DB_CA_PATH)
        ),
      },
    }
  : {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: Number(process.env.DATABASE_PORT),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

// Use global variable to prevent multiple pools in dev mode
if (!global._pool) {
  global._pool = mysql.createPool(config);
}

pool = global._pool;

export { pool };
