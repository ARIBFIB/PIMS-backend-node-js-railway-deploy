// Test database connection
const pool = require('./src/config/database');

async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    
    const conn = await pool.getConnection();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await conn.query('SELECT 1 as test');
    console.log('✅ Database query successful:', result);
    
    conn.release();
    
    // Test user table existence
    try {
      const users = await conn.query('SELECT COUNT(*) as count FROM users');
      console.log('✅ Users table accessible, count:', users[0].count);
    } catch (error) {
      console.log('❌ Users table not accessible:', error.message);
    }
    
    await pool.end();
    console.log('✅ Database test completed');
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error:', error.message);
  }
}

testDbConnection();