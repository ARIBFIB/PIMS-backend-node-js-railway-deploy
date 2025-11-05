// Test script to verify Railway database connection
require('dotenv').config({ path: __dirname + '/.env' });

// Simulate Railway environment variables
process.env.MYSQLHOST = process.env.MYSQLHOST || 'mysql.railway.internal';
process.env.MYSQLUSER = process.env.MYSQLUSER || 'root';
process.env.MYSQLPASSWORD = process.env.MYSQLPASSWORD || 'zdXObLEjXJnhPdVtXpxMKmIbLkvZZvoR';
process.env.MYSQLDATABASE = process.env.MYSQLDATABASE || 'railway';
process.env.MYSQLPORT = process.env.MYSQLPORT || '3306';

const pool = require('./src/config/database');

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Successfully connected to database');
    
    // Test a simple query
    const result = await conn.query('SELECT 1 as test');
    console.log('✅ Database query test passed:', result);
    
    conn.release();
    
    // Close the pool
    await pool.end();
    console.log('✅ Database connection test completed successfully');
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
  }
}

testConnection();