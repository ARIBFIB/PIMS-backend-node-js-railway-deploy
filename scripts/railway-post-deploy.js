#!/usr/bin/env node

const mysql = require('mysql2/promise');
// Don't require dotenv in Railway environment as env vars are already set
if (!process.env.MYSQLDATABASE) {
  require('dotenv').config();
}

async function runRailwayPostDeploy() {
  console.log('🚀 Running Railway post-deploy setup...');
  
  let connection;
  
  try {
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      user: process.env.MYSQLUSER || process.env.DB_USER,
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    });
    
    console.log('✅ Connected to Railway database successfully');
    console.log('🔧 Database info:', {
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      port: process.env.MYSQLPORT || process.env.DB_PORT,
      user: process.env.MYSQLUSER || process.env.DB_USER,
      database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    });
    
    // Check if recipeUnit column exists
    console.log('🔍 Checking if recipeUnit column exists...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM recipes LIKE 'recipeUnit'"
    );
    
    if (columns.length === 0) {
      console.log('➕ Adding recipeUnit column to recipes table...');
      await connection.execute(
        "ALTER TABLE recipes ADD COLUMN recipeUnit VARCHAR(50) DEFAULT 'unit'"
      );
      console.log('✅ Successfully added recipeUnit column to recipes table');
    } else {
      console.log('✅ recipeUnit column already exists in recipes table');
    }
    
    // Check if sub_categories table exists
    console.log('🔍 Checking if sub_categories table exists...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'sub_categories'"
    );
    
    console.log('📊 SHOW TABLES result:', tables);
    
    if (tables.length === 0) {
      console.log('➕ Creating sub_categories table...');
      await connection.execute(`
        CREATE TABLE sub_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          categoryId INT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);
      console.log('✅ Successfully created sub_categories table');
    } else {
      console.log('✅ sub_categories table already exists');
      
      // Check if categoryId column allows NULL values
      const [columns] = await connection.execute("DESCRIBE sub_categories categoryId");
      console.log('📊 DESCRIBE sub_categories categoryId result:', columns);
      if (columns[0] && columns[0].Null === 'NO') {
        console.log('➕ Updating sub_categories table structure...');
        await connection.execute(`
          ALTER TABLE sub_categories 
          MODIFY categoryId INT NULL,
          DROP FOREIGN KEY IF EXISTS sub_categories_ibfk_1,
          ADD CONSTRAINT sub_categories_ibfk_1 FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
        `);
        console.log('✅ Successfully updated sub_categories table structure');
      } else {
        console.log('✅ sub_categories table structure is correct');
      }
    }
    
    // Check if subCategoryId column exists in materials table
    console.log('🔍 Checking if subCategoryId column exists in materials table...');
    const [materialColumns] = await connection.execute("SHOW COLUMNS FROM materials LIKE 'subCategoryId'");
    
    console.log('📊 SHOW COLUMNS result:', materialColumns);
    
    if (materialColumns.length === 0) {
      console.log('➕ Adding subCategoryId column to materials table...');
      await connection.execute(`
        ALTER TABLE materials 
        ADD COLUMN subCategoryId INT NULL,
        ADD FOREIGN KEY (subCategoryId) REFERENCES sub_categories(id) ON DELETE SET NULL
      `);
      console.log('✅ Successfully added subCategoryId column to materials table');
    } else {
      console.log('✅ subCategoryId column already exists in materials table');
    }
    
    await connection.end();
    console.log('✅ Database connection closed');
    console.log('🎉 Railway post-deploy setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Railway post-deploy setup failed:', error.message);
    console.error('Error stack:', error.stack);
    if (connection) {
      await connection.end();
    }
    // Don't exit with error code as this might prevent deployment
    console.log('⚠️  Continuing with deployment...');
  }
}

// Run the post-deploy setup
if (require.main === module) {
  runRailwayPostDeploy();
}

module.exports = runRailwayPostDeploy;