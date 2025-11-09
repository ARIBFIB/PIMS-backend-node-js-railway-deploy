const mysql = require('mysql2/promise');
require('dotenv').config();

// Use Railway environment variables or fallback to .env values
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'pims',
  connectTimeout: 10000, // 10 seconds
};

async function testConnection() {
  try {
    console.log('Testing database connection with config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
    });
    
    console.log('Attempting to connect to database...');
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Simple query test successful:', rows);
    
    await connection.end();
    console.log('✅ Database connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    if (error.sqlState) {
      console.error('SQL State:', error.sqlState);
    }
    if (error.fatal) {
      console.error('Fatal error:', error.fatal);
    }
    process.exit(1);
  }
}

testConnection();