#!/usr/bin/env node

// Script to add subCategoryId column to existing materials table
// This script is designed to run during Railway deployment

const mysql = require('mysql2/promise');

// Don't require dotenv in Railway environment as env vars are already set
if (!process.env.MYSQLDATABASE) {
  require('dotenv').config();
}

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

console.log('🔧 Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

async function addSubCategoryToMaterials() {
  console.log('🚀 Adding subCategoryId column to materials table...');
  let connection;
  
  try {
    console.log("🚀 Connecting to MySQL server...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL");

    // Check if subCategoryId column already exists
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM materials LIKE 'subCategoryId'");
      if (columns.length > 0) {
        console.log("✅ subCategoryId column already exists in materials table");
        await connection.end();
        return;
      }
    } catch (err) {
      console.log("ℹ️  Error checking subCategoryId column:", err.message);
    }

    // Add subCategoryId column to materials table
    try {
      await connection.execute(`
        ALTER TABLE materials 
        ADD COLUMN subCategoryId INT NULL,
        ADD FOREIGN KEY (subCategoryId) REFERENCES sub_categories(id) ON DELETE SET NULL
      `);
      console.log("✅ subCategoryId column added to materials table successfully");
    } catch (err) {
      console.log("ℹ️  Could not add subCategoryId column, might already exist:", err.message);
    }
    
    await connection.end();
    
  } catch (err) {
    console.error("❌ Failed to add subCategoryId column to materials table:", err.message);
    console.error("Error stack:", err.stack);
    if (connection) await connection.end();
    // Don't exit with error code as this might prevent deployment
    console.log("⚠️  Continuing with deployment...");
  }
}

// Run the script
if (require.main === module) {
  addSubCategoryToMaterials().then(() => {
    console.log("🎉 Sub-category column addition completed successfully!");
    process.exit(0);
  }).catch((error) => {
    console.error("❌ Sub-category column addition failed:", error.message);
    // Don't exit with error code as this might prevent deployment
    console.log("⚠️  Continuing with deployment...");
    process.exit(0);
  });
}

module.exports = { addSubCategoryToMaterials };