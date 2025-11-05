const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('CREATE DATABASE')) {
        // Skip CREATE DATABASE statements as Railway provides the database
        continue;
      }
      
      if (statement.toUpperCase().startsWith('USE ')) {
        // Skip USE statements as we're already connected to the correct database
        continue;
      }
      
      try {
        await pool.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        // Ignore errors for statements that might fail if tables already exist
        if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
          console.warn('Warning executing statement:', error.message);
        }
      }
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = initDatabase;