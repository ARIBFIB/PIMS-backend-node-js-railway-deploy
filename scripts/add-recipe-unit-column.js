const mysql = require('mysql2/promise');
require('dotenv').config();

async function addRecipeUnitColumn() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pims',
    });
    
    console.log('Connected to database successfully');
    
    // Check if recipeUnit column exists
    console.log('Checking if recipeUnit column exists...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM recipes LIKE 'recipeUnit'"
    );
    
    if (columns.length === 0) {
      console.log('Adding recipeUnit column to recipes table...');
      await connection.execute(
        "ALTER TABLE recipes ADD COLUMN recipeUnit VARCHAR(50) DEFAULT 'unit'"
      );
      console.log('✅ Successfully added recipeUnit column to recipes table');
    } else {
      console.log('✅ recipeUnit column already exists in recipes table');
    }
    
    await connection.end();
    console.log('✅ Database connection closed');
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nYou can now restart your backend server and try creating recipes again.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  addRecipeUnitColumn();
}

module.exports = addRecipeUnitColumn;