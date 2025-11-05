// Railway debug test - simulate Railway environment
console.log('Simulating Railway environment...');

// Set Railway-style environment variables
process.env.PORT = '8080';
process.env.NODE_ENV = 'production';

console.log('Environment variables set:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Start the application
console.log('\nStarting application...');

require('./server.js');