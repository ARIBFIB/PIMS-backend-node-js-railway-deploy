// Test script to verify Railway database connection with updated config
require('dotenv').config({ path: __dirname + '/.env' });

const mariadb = require('mariadb');

// Database configuration with Railway-specific options
const config = {
  host: process.env.DB_HOST || 'nozomi.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'zdXObLEjXJnhPdVtXpxMKmIbLkvZZvoR',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 40148,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  allowPublicKeyRetrieval: true,
  ssl: false
};

const pool = mariadb.createPool(config);

async function testConnection() {
  try {
    console.log('Testing database connection with config:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
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
    console.error('Error details:', error);
  }
}

testConnection();