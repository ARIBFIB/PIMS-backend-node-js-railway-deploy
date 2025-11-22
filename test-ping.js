const express = require('express');
const app = express();

// Simple ping endpoint
app.get('/ping', (req, res) => {
  console.log('🏓 Ping endpoint called');
  res.send('pong');
});

// Test endpoint
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server listening on port ${PORT}`);
  console.log('Health check endpoint: /ping');
});