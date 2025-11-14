// Simple script to test and initialize the database locally
require('dotenv').config({ path: '.env.local' });
const { initDatabase } = require('./src/config/database');

async function testAndInit() {
  console.log('Starting database initialization...');
  await initDatabase();
  console.log('Database initialization completed.');
}

testAndInit().catch(err => {
  console.error('Error during database initialization:', err);
  process.exit(1);
});