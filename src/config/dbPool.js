const mysql = require('mysql2/promise');

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
  connectTimeout: 20000
};

console.log('Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Add event listeners for debugging
pool.on('connection', (connection) => {
  console.log('✅ New database connection established');
});

pool.on('error', (error) => {
  console.error('❌ Database pool error:', error.message);
});

// Add acquire and release events for debugging
pool.on('acquire', (connection) => {
  console.log('✅ Connection acquired from pool');
});

pool.on('release', (connection) => {
  console.log('✅ Connection released back to pool');
});

module.exports = pool;