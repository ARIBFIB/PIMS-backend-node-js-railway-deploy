const mariadb = require('mariadb');

// Database configuration that works with both Railway and local environments
const config = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'prodx',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

const pool = mariadb.createPool(config);

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('Connected to database successfully');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
  });

module.exports = pool;