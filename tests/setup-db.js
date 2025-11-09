const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  console.log('Setting up test database...');
  
  try {
    // Create connection without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'pims'}`);
    console.log(`Database '${process.env.DB_NAME || 'pims'}' created or already exists`);
    
    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'pims'}`);
    
    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
        unitPrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
        lowStockThreshold DECIMAL(10, 2) NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        costPerUnit DECIMAL(10, 2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        materialId INT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (materialId) REFERENCES materials(id) ON DELETE CASCADE
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        quantityProduced DECIMAL(10, 2) NOT NULL,
        materialCost DECIMAL(10, 2) NOT NULL,
        additionalExpense DECIMAL(10, 2) NOT NULL DEFAULT 0,
        totalCost DECIMAL(10, 2) GENERATED ALWAYS AS (materialCost + additionalExpense) STORED,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recipeId) REFERENCES recipes(id)
      )
    `);
    
    // Insert default admin user if not exists
    const [userRows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      ['admin@example.com']
    );
    
    if (userRows.length === 0) {
      await connection.execute(
        `INSERT INTO users (name, email, password, role) 
         VALUES (?, ?, ?, ?)`,
        ['Admin User', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin']
      );
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    await connection.end();
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Please make sure MySQL server is running on your system.');
      console.error('You can start MySQL service or install MySQL if not already installed.');
    }
    process.exit(1);
  }
}

setupDatabase();