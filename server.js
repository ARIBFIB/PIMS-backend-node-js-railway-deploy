// Server for Railway deployment - using the full application with error handling
// Don't require dotenv in Railway environment as env vars are already set
if (!process.env.MYSQLDATABASE) {
  require('dotenv').config();
}

console.log('Starting server...');
console.log('🔧 Environment info:', {
  PORT: process.env.PORT,
  MYSQLHOST: process.env.MYSQLHOST,
  MYSQLPORT: process.env.MYSQLPORT,
  MYSQLUSER: process.env.MYSQLUSER,
  MYSQLDATABASE: process.env.MYSQLDATABASE,
});

// Use Railway's PORT or default to 4000
const PORT = process.env.PORT || 4000;

console.log(`Attempting to start server on port ${PORT}`);

try {
  const app = require('./src/app');
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server successfully listening on port ${PORT}`);
    console.log('All API routes are available');
    console.log('Health check endpoint: /ping');
  });
  
  // Increase the timeout for the server to start
  server.setTimeout(120000);
  
  // Handle server errors
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
  });
  
  // Handle process termination signals
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
  
} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('Error stack:', error.stack);
  // Don't exit the process, let Railway handle it
}