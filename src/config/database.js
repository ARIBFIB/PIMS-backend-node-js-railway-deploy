const mysql = require('mysql2/promise');
require('dotenv').config();

// Parse database configuration
let dbConfig = {};

// If MYSQL_URL is provided, use it
if (process.env.MYSQL_URL) {
  try {
    const url = new URL(process.env.MYSQL_URL);
    dbConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
  } catch (error) {
    console.error('Error parsing MYSQL_URL:', error.message);
  }
} 
// Otherwise, use individual environment variables
else if (process.env.DB_HOST) {
  dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}
// Fallback to Railway's standard environment variables
else {
  dbConfig = {
    host: process.env.MYSQLHOST || 'mysql-odu5.railway.internal',
    port: parseInt(process.env.MYSQLPORT) || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'NSsYtayIZiLehwcekexDHEEcowKqAJzY',
    database: process.env.MYSQLDATABASE || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

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
      console.error('❌ Database connection failed after maximum retries.');
      console.error('💡 Troubleshooting tips:');
      console.error('1. Check your database credentials');
      console.error('2. Verify database user permissions');
      console.error('3. Ensure the database is accessible from your application');
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