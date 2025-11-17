require('dotenv').config();

// Create a simple express app with just the ping endpoint
const express = require('express');
const app = express();

// Add the ping endpoint for Railway health checks
app.get('/ping', (req, res) => res.send('pong'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});