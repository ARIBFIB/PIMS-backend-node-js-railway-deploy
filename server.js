require('dotenv').config();
console.log('🚀 Application starting...');

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Add a simple ping endpoint for Railway health checks
app.get('/ping', (req, res) => res.send('pong'));

console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- Parsed PORT:', PORT);

console.log(`🚀 Starting server on port ${PORT}...`);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`CORS enabled for all origins`);
});

console.log('✅ Server startup process completed');