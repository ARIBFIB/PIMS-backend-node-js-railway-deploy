require('dotenv').config();
const mysql = require('mysql2/promise');

const initDatabase = async () => {
  // Create connection without specifying database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connecting to MySQL...');
    
    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS pims');
    console.log('Database "pims" created or already exists');
    
    // Use the database
    await connection.query('USE pims');
    console.log('Using database "pims"');
    
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      if (statement.trim() !== '') {
        try {
          await connection.query(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.log('Skipped statement (may already exist):', statement.substring(0, 50) + '...');
        }
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
};

initDatabase();