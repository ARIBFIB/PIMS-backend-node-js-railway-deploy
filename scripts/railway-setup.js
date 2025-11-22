const { initDatabase, testConnection } = require('../src/config/database');
const { addSubCategoryTable } = require('./add-subcategory-table');

async function setupRailwayDatabase() {
  console.log('Setting up Railway database...');
  
  // Test connection with multiple retries
  let retries = 5;
  let connected = false;
  
  while (retries > 0 && !connected) {
    console.log(`Attempting to connect to database (${retries} retries left)...`);
    connected = await testConnection();
    
    if (!connected) {
      console.log('Waiting 5 seconds before retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      retries--;
    }
  }
  
  if (connected) {
    try {
      await initDatabase();
      console.log('✅ Railway database setup completed successfully!');
      
      // Add sub-categories table
      await addSubCategoryTable();
      console.log('✅ Sub-categories table added successfully!');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to initialize Railway database:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Failed to connect to Railway database after multiple attempts');
    process.exit(1);
  }
}

setupRailwayDatabase();