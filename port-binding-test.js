// Port binding verification test
const express = require('express');
const app = express();

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Test server running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get port from environment or default to 8080
const PORT = process.env.PORT || 8080;
console.log(`Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`Address info:`, address);
  
  // List all network interfaces
  const os = require('os');
  const interfaces = os.networkInterfaces();
  console.log('\nNetwork interfaces:');
  for (const [name, iface] of Object.entries(interfaces)) {
    console.log(`  ${name}:`, iface.map(i => i.address).join(', '));
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});