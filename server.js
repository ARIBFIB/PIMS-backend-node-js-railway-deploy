// Ultra-minimal server for Railway deployment with comprehensive CORS support
const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS for your specific frontend domains
const corsOptions = {
  origin: [
    'https://pims-project-61fb3d.netlify.app',
    'https://6919f5629afbf6133ebe90d7--pims-project-61fb3d.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

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