// Ultra-minimal server for Railway deployment
const express = require('express');
const app = express();

// Simple health check endpoint
app.get('/ping', (req, res) => {
  console.log('Ping endpoint hit');
  res.status(200).send('pong');
});

// Test endpoint
app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// Use Railway's PORT or default to 5000
const PORT = process.env.PORT || 5000;

console.log(`Starting server, PORT env var: ${process.env.PORT}`);
console.log(`Using port: ${PORT}`);

// Simple server startup
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Ready for health checks');
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});