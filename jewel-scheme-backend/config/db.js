
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Gopalyuvi@5293",
  database: process.env.DB_NAME || "jewel_scheme",
  port: parseInt(process.env.DB_PORT) || 3306,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: "+05:30",
  charset: 'utf8mb4'
};


// console.log('Database Config:', { 
//   ...dbConfig, 
//   password: dbConfig.password ? '***' : 'not set' 
// });

const pool = mysql.createPool(dbConfig);


(async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Current environment:', process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

export default pool;





