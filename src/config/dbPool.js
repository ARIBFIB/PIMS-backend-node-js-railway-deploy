const mysql = require('mysql2/promise');

// Don't require dotenv in Railway environment as env vars are already set
if (!process.env.MYSQLDATABASE) {
  require('dotenv').config();
}

// Database configuration (supports Railway & local)
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || "3306"),
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "admin_pims",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 20000,
  acquireTimeout: 20000,
  timeout: 20000
};

console.log('🔧 Database pool configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  MYSQLHOST: process.env.MYSQLHOST,
  MYSQLPORT: process.env.MYSQLPORT,
  MYSQLUSER: process.env.MYSQLUSER,
  MYSQLDATABASE: process.env.MYSQLDATABASE,
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Add event listeners for debugging
pool.on('connection', (connection) => {
  console.log('✅ New database connection established');
});

pool.on('error', (error) => {
  console.error('❌ Database pool error:', error.message);
  console.error('Error code:', error.code);
  console.error('Error errno:', error.errno);
  console.error('Error sqlState:', error.sqlState);
});

// Add acquire and release events for debugging
pool.on('acquire', (connection) => {
  console.log('✅ Connection acquired from pool');
});

pool.on('release', (connection) => {
  console.log('✅ Connection released back to pool');
});

// Test the database connection
async function testConnection() {
  let connection;
  try {
    console.log('🔍 Testing database connection...');
    connection = await pool.getConnection();
    await connection.ping();
    console.log('✅ Database connection test successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    if (connection) {
      connection.release();
    }
    return false;
  }
}

// Run the test connection immediately
testConnection().catch(console.error);

module.exports = pool;