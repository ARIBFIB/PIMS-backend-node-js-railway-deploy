// Server for Railway deployment - using the full application
require('dotenv').config();

const app = require('./src/app');

// Use Railway's PORT or default to 4000
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('All API routes are available');
  console.log('Health check endpoint: /ping');
});