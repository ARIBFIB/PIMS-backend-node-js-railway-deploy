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
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}