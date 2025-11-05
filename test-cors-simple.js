// Simple CORS test
const axios = require('axios');

async function testCors() {
  try {
    console.log('Testing CORS with simplified configuration...');
    
    // Test preflight request
    const preflightResponse = await axios.options('https://prodx-backend-production.up.railway.app/api/auth/login', {
      headers: {
        'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ Preflight request successful');
    console.log('Preflight status:', preflightResponse.status);
    console.log('Access-Control-Allow-Origin:', preflightResponse.headers['access-control-allow-origin']);
    
    // Test actual request
    const loginResponse = await axios.post('https://prodx-backend-production.up.railway.app/api/auth/login', {
      email: 'admin@prodx.com',
      password: 'Admin123'
    }, {
      headers: {
        'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app'
      }
    });
    
    console.log('✅ Login request successful');
    console.log('Login status:', loginResponse.status);
  } catch (error) {
    console.log('❌ Test failed');
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response headers:', error.response.headers);
    } else {
      console.log('Error message:', error.message);
    }
  }
}

testCors();