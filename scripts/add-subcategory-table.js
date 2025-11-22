#!/usr/bin/env node

// Script to add sub_categories table to existing database
// This script is designed to run during Railway deployment

const mysql = require('mysql2/promise');

// Database configuration (supports Railway & local)
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "admin_pims",
  multipleStatements: true,
  connectTimeout: 20000,
};

console.log('Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

async function addSubCategoryTable() {
  console.log('🚀 Adding sub_categories table to database...');
  let connection;
  
  try {
    console.log("🚀 Connecting to MySQL server...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL");

    // Check if sub_categories table already exists
    try {
      const [rows] = await connection.execute("SHOW TABLES LIKE 'sub_categories'");
      if (rows.length > 0) {
        console.log("✅ sub_categories table already exists");
        // Check if categoryId column allows NULL values
        const [columns] = await connection.execute("DESCRIBE sub_categories categoryId");
        if (columns[0] && columns[0].Null === 'YES') {
          console.log("✅ sub_categories table structure is correct");
          await connection.end();
          return;
        } else {
          console.log("⚠️  Updating sub_categories table structure...");
          // Modify the table structure
          await connection.execute(`
            ALTER TABLE sub_categories 
            MODIFY categoryId INT NULL,
            DROP FOREIGN KEY IF EXISTS sub_categories_ibfk_1,
            ADD CONSTRAINT sub_categories_ibfk_1 FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
          `);
          console.log("✅ sub_categories table structure updated");
          await connection.end();
          return;
        }
      }
    } catch (err) {
      console.log("ℹ️  sub_categories table does not exist or error checking it:", err.message);
    }

    // Create sub_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sub_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        categoryId INT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);
    
    console.log("✅ sub_categories table created successfully");
    await connection.end();
    
  } catch (err) {
    console.error("❌ Failed to add sub_categories table:", err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addSubCategoryTable().then(() => {
    console.log("🎉 Sub-categories table setup completed successfully!");
    process.exit(0);
  }).catch((error) => {
    console.error("❌ Sub-categories table setup failed:", error.message);
    process.exit(1);
  });
}

module.exports = { addSubCategoryTable };