// init-db.js - Database initialization script for Railway deployment
const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway database configuration
const dbConfig = {
  host: process.env.MYSQLHOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'railway',
  multipleStatements: true,
  connectTimeout: 20000,
};

async function initDatabase() {
  let connection;

  try {
    console.log('🚀 Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to MySQL');

    // Read and execute the railway schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'railway-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🧱 Creating tables...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (err) {
        // Skip errors for duplicate column additions
        if (!err.message.includes('Duplicate column name') && 
            !err.message.includes('Duplicate foreign key constraint name') &&
            !err.message.includes('already exists')) {
          throw err;
        }
        console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
      }
    }
    
    console.log('✅ Database initialized successfully');
    await connection.end();
    
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDatabase();