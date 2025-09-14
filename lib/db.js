import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// let pool;

const isProd = process.env.VERCEL === "1";

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
      host: process.env.DATABASE_HOST || "127.0.0.1",
      user: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD || "root",
      database: process.env.DATABASE_NAME || "budget_tracker",
      port: Number(process.env.DATABASE_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

if (!global._pool) {
  global._pool = mysql.createPool(config);
}

export const pool = global._pool;
