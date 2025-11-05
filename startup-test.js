// Startup test to simulate server.js
require('dotenv').config({ path: __dirname + '/.env' });
console.log('Environment variables loaded');

// Test database connection
const pool = require('./src/config/database');
console.log('Database module loaded');

// Test if we can get a connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connection successful');
    conn.release();
    
    // Test a simple query
    return pool.query('SELECT 1 as test');
  })
  .then(result => {
    console.log('✅ Database query successful:', result);
    
    // Now test the app
    console.log('Loading app...');
    const app = require('./src/app');
    console.log('App loaded successfully');
    
    const PORT = process.env.PORT || 8080;
    console.log(`Starting server on port ${PORT}...`);
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
  })
  .catch(err => {
    console.error('❌ Startup test failed:', err.message);
    console.error('Error stack:', err.stack);
  });