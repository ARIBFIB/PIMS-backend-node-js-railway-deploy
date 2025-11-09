const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('=== Database Connection Debug Script ===');

// Check environment variables
console.log('Environment Variables:');
console.log('- MYSQLHOST:', process.env.MYSQLHOST || 'mysql-odu5.railway.internal');
console.log('- MYSQLPORT:', process.env.MYSQLPORT || '3306');
console.log('- MYSQLUSER:', process.env.MYSQLUSER || 'root');
console.log('- MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'Set (length: ' + process.env.MYSQLPASSWORD.length + ')' : 'NSsYtayIZiLehwcekexDHEEcowKqAJzY');
console.log('- MYSQLDATABASE:', process.env.MYSQLDATABASE || 'railway');

// Use Railway environment variables or fallback to .env values
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'pims',
  connectTimeout: 5000, // 5 seconds
};

console.log('\nConnection Configuration:');
console.log('- Host:', dbConfig.host);
console.log('- Port:', dbConfig.port);
console.log('- User:', dbConfig.user);
console.log('- Database:', dbConfig.database);

async function debugConnection() {
  console.log('\n=== Testing Connection ===');
  
  try {
    console.log('Creating connection...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection created successfully');
    
    console.log('Pinging database...');
    await connection.ping();
    console.log('✅ Ping successful');
    
    console.log('Executing test query...');
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('✅ Query successful:', rows[0]);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
    console.log('\n🎉 All tests passed! Database connection is working correctly.');
  } catch (error) {
    console.error('\n❌ Connection failed with error:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Errno:', error.errno);
    
    if (error.sqlState) {
      console.error('SQL State:', error.sqlState);
    }
    
    if (error.fatal) {
      console.error('Fatal:', error.fatal);
    }
    
    // Provide specific troubleshooting advice based on error
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Troubleshooting Tips:');
      console.error('1. Check that your database username and password are correct');
      console.error('2. Verify that the database user has permission to connect from your IP address');
      console.error('3. If using Railway, ensure the database is properly provisioned and accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Troubleshooting Tips:');
      console.error('1. Check that the database server is running');
      console.error('2. Verify the host and port are correct');
      console.error('3. Ensure network connectivity to the database server');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🔧 Troubleshooting Tips:');
      console.error('1. Check that the database host is correct');
      console.error('2. Verify DNS resolution for the host');
    }
    
    process.exit(1);
  }
}

debugConnection();