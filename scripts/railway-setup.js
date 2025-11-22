#!/usr/bin/env node

const { initDatabase, testConnection } = require('../src/config/database');
const { addSubCategoryTable } = require('./add-subcategory-table');

// Don't require dotenv in Railway environment as env vars are already set
if (!process.env.MYSQLDATABASE) {
  require('dotenv').config();
}

async function setupRailwayDatabase() {
  console.log('Setting up Railway database...');
  console.log('🔧 Environment info:', {
    MYSQLHOST: process.env.MYSQLHOST,
    MYSQLPORT: process.env.MYSQLPORT,
    MYSQLUSER: process.env.MYSQLUSER,
    MYSQLDATABASE: process.env.MYSQLDATABASE,
  });
  
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
      console.error('Error stack:', error.stack);
      process.exit(1);
    }
  } else {
    console.error('❌ Failed to connect to Railway database after multiple attempts');
    process.exit(1);
  }
}

setupRailwayDatabase();