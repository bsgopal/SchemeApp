// db.js - hybrid config for local + Render
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",       // fallback to localhost
  user: process.env.DB_USER || "root",            // fallback to root
  password: process.env.DB_PASSWORD || "Gopalyuvi@5293", // fallback to local password
  database: process.env.DB_NAME || "jewel_scheme", // fallback DB
  port: process.env.DB_PORT || 3306,              // fallback port
  connectionLimit: 10,
});

export default pool;
