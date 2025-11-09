const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration with Railway-compatible settings
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'pims',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Add connection timeout settings to prevent hanging
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
};

console.log('Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    console.log('Attempting to connect to database...');
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    if (error.sqlState) {
      console.error('SQL State:', error.sqlState);
    }
    return false;
  }
};

// Initialize database connection with retry logic and backoff
const initializeDatabase = async (retryCount = 0) => {
  const maxRetries = 10;
  const baseDelay = 5000; // 5 seconds
  const maxDelay = 30000; // 30 seconds
  
  const isConnected = await testConnection();
  if (!isConnected) {
    if (retryCount < maxRetries) {
      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(1.5, retryCount) + Math.random() * 1000, maxDelay);
      console.log(`⚠️  Retrying database connection in ${Math.round(delay/1000)} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
      setTimeout(() => initializeDatabase(retryCount + 1), delay);
    } else {
      console.error('❌ Database connection failed after maximum retries. Please check your database credentials and permissions.');
      process.exit(1);
    }
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