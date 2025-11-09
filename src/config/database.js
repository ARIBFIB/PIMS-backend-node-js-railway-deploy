const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration with enhanced settings
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pims',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,      // 60 seconds to acquire connection
  timeout: 60000,             // 60 seconds for query execution
  reconnect: true,             // Automatically reconnect
  idleTimeout: 300000,         // 5 minutes idle timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database connection
const initializeDatabase = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('⚠️  Retrying database connection in 5 seconds...');
    setTimeout(initializeDatabase, 5000);
  }
};

// Initialize on startup
initializeDatabase();

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    initializeDatabase();
  }
});

module.exports = pool;