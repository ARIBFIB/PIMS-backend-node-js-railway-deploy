#!/usr/bin/env node

// Railway-specific setup script
const { initDatabase, testConnection } = require('../src/config/database');

async function railwaySetup() {
  console.log('🚀 Starting Railway setup...');
  
  // Test database connection
  console.log('🔍 Testing database connection...');
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('❌ Database connection failed. Exiting setup.');
    process.exit(1);
  }
  
  console.log('✅ Database connection successful.');
  
  // Initialize database
  console.log('📋 Initializing database...');
  try {
    await initDatabase();
    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Railway setup completed successfully!');
}

// Run setup if this script is executed directly
if (require.main === module) {
  railwaySetup().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { railwaySetup };