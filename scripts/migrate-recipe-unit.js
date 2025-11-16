const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateRecipeUnit() {
  let connection;
  
  try {
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pims',
    });
    
    console.log('Connected to database');
    
    // Check if recipeUnit column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM recipes LIKE 'recipeUnit'"
    );
    
    if (columns.length === 0) {
      // Add the recipeUnit column
      await connection.execute(
        "ALTER TABLE recipes ADD COLUMN recipeUnit VARCHAR(50) DEFAULT 'unit'"
      );
      console.log('✅ Added recipeUnit column to recipes table');
    } else {
      console.log('✅ recipeUnit column already exists');
    }
    
    await connection.end();
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Run the migration
migrateRecipeUnit();