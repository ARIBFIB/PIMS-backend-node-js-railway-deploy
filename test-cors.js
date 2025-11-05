// Test script to verify CORS configuration
const axios = require('axios');

async function testCors() {
  try {
    console.log('Testing CORS configuration...');
    
    const response = await axios.post('https://prodx-backend-production.up.railway.app/api/auth/login', {
      email: 'admin@prodx.com',
      password: 'Admin123'
    }, {
      headers: {
        'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app'
      }
    });
    
    console.log('✅ CORS test successful');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response headers:', error.response.headers);
      console.log('Response data:', error.response.data);
    } else {
      console.log('❌ CORS test failed');
      console.log('Error message:', error.message);
    }
  }
}

testCors();