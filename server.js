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

// Add a timeout to ensure the server starts
const serverStartTimeout = setTimeout(() => {
  console.log('⚠️  Server start timeout reached, but continuing...');
}, 30000);

try {
  const app = require('./src/app');
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    clearTimeout(serverStartTimeout);
    console.log(`✅ Server successfully listening on port ${PORT}`);
    console.log('All API routes are available');
    console.log('Health check endpoint: /ping');
  });
  
  // Increase the timeout for the server to start
  server.setTimeout(120000);
  
  server.on('error', (err) => {
    clearTimeout(serverStartTimeout);
    console.error('❌ Server error:', err);
    // Don't exit the process, let Railway handle it
  });
  
} catch (error) {
  clearTimeout(serverStartTimeout);
  console.error('❌ Failed to start server:', error);
  // Don't exit the process, let Railway handle it
}