
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });


// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00',
  charset: 'utf8mb4'
};

// Log database config (without password) for debugging
console.log('Database Config:', { 
  ...dbConfig, 
  password: dbConfig.password ? '***' : 'not set' 
});

const pool = mysql.createPool(dbConfig);

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to:', process.env.DB_HOST);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Current environment:', process.env.NODE_ENV);
    
    // Don't exit in development to allow for auto-restart with nodemon
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

export default pool;
