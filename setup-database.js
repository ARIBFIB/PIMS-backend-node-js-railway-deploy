const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // First connect without specifying database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'pims'}`);
    console.log(`Database ${process.env.DB_NAME || 'pims'} created or already exists`);
    
    // Close the connection
    await connection.end();
    
    // Now connect to the specific database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pims',
    });
    
    console.log('Connected to database');
    
    // Create tables
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Materials table
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
        unitPrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
        lowStockThreshold DECIMAL(10, 2) NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Recipes table
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        recipeUnit VARCHAR(50) DEFAULT 'unit',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Recipe ingredients table
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        materialId INT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (materialId) REFERENCES materials(id) ON DELETE CASCADE
      );

      -- Production logs table
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
      );
    `;
    
    // Split and execute each table creation
    const tables = createTablesSQL.split(';').filter(sql => sql.trim());
    for (const tableSQL of tables) {
      if (tableSQL.trim()) {
        await connection.execute(tableSQL);
      }
    }
    
    console.log('Tables created successfully');
    
    // Insert default admin user with properly hashed password
    await connection.execute(
      `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Admin User', 'admin@example.com', '$2b$10$IxhgKfJq1yb900HvtYpmqOj95kl2HidCDdkWQSHI8m5Efkpqbfa22', 'admin']  // Properly hashed password
    );
    
    console.log('Default admin user created (email: admin@example.com, password: admin123)');
    
    // Insert sample materials
    await connection.execute(`
      INSERT IGNORE INTO materials (name, unit, quantity, unitPrice, lowStockThreshold) VALUES
      ('Flour', 'kg', 200, 120, 50),
      ('Sugar', 'kg', 100, 140, 30),
      ('Salt', 'kg', 50, 20, 10),
      ('Oil', 'l', 30, 150, 5),
      ('Yeast', 'g', 500, 0.5, 100)
    `);
    
    console.log('Sample materials inserted');
    
    await connection.end();
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Run the setup
setupDatabase();