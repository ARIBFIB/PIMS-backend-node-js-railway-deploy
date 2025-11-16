const mysql = require('mysql2/promise');
require('dotenv').config();

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
    
    await connection.end();
    console.log('✅ Database connection closed');
    console.log('🎉 Railway post-deploy setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Railway post-deploy setup failed:', error.message);
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