// Server for Railway deployment - using the full application with error handling
require('dotenv').config();

console.log('Starting server...');

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