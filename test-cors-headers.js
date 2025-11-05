// Test CORS headers
const axios = require('axios');

async function testCorsHeaders() {
  try {
    console.log('Testing CORS headers...');
    
    // Test preflight request
    const response = await axios.options('https://prodx-backend-production.up.railway.app/api/auth/login', {
      headers: {
        'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ Preflight request successful');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    // Check for CORS headers
    console.log('Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('Access-Control-Allow-Methods:', response.headers['access-control-allow-methods']);
    console.log('Access-Control-Allow-Headers:', response.headers['access-control-allow-headers']);
    
  } catch (error) {
    console.log('❌ Preflight request failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testCorsHeaders();