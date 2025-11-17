// Minimal server for Railway deployment with Express v4
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Simple health check endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Use Railway's PORT or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});