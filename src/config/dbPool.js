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
    // Test a simple query
    connection.query('SELECT 1+1 AS solution')
      .then(([rows]) => {
        console.log('✅ Database query test successful:', rows[0].solution);
        connection.release();
      })
      .catch(error => {
        console.error('❌ Database query test failed:', error.message);
        connection.release();
      });
  })
  .catch(error => {
    console.error('❌ Database pool connection failed:', error.message);
  });

// Add event listeners for debugging
pool.on('connection', (connection) => {
  console.log('✅ New database connection established');
});

pool.on('error', (error) => {
  console.error('❌ Database pool error:', error.message);
});

module.exports = pool;