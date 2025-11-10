// Script to initialize database tables
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration - Use Railway's environment variables or fallback
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'mysql.railway.internal',
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
};

console.log('Database configuration for initialization:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
});

async function initDatabase() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');
    
    console.log('Creating tables...');
    
    // Create users table
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
    console.log('✅ Users table created');
    
    // Create materials table
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
    console.log('✅ Materials table created');
    
    // Create recipes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Recipes table created');
    
    // Create recipe ingredients table
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
    console.log('✅ Recipe ingredients table created');
    
    // Create production logs table
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
    console.log('✅ Production logs table created');
    
    // Insert default admin user
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@example.com']
    );
    
    if (existingUsers.length === 0) {
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@example.com', 'admin123', 'admin']
      );
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    await connection.end();
    console.log('✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDatabase();