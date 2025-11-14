const mysql = require('mysql2/promise');

// Database configuration (supports Railway & local)
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "admin_pims",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test the pool connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database pool connection successful');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database pool connection failed:', error.message);
  });

module.exports = pool;