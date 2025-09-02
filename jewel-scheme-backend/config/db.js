// db.js - updated for ES6
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_NAME:", process.env.DB_NAME);
// console.log("DB_PORT:", process.env.DB_PORT);

const pool = mysql.createPool({
  host: "localhost",       // your DB host
  user: "root",            // your DB username
  password: "Gopalyuvi@5293",      // your DB password
  database: "jewel_scheme", // your DB name
  port: 3306,              // your DB port
  connectionLimit: 10,
});

export default pool;