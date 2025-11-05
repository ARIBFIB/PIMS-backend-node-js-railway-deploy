// Test server connectivity and routes
const axios = require('axios');

async function testServer() {
  try {
    console.log('Testing server connectivity...');
    
    // Test health endpoint
    const healthResponse = await axios.get('https://prodx-backend-production.up.railway.app/health');
    console.log('✅ Health endpoint accessible');
    console.log('Health status:', healthResponse.data);
    
    // Test env-check endpoint
    const envResponse = await axios.get('https://prodx-backend-production.up.railway.app/env-check');
    console.log('✅ Env-check endpoint accessible');
    console.log('Env data:', envResponse.data);
    
    // Test auth login endpoint (POST request)
    try {
      const loginResponse = await axios.post('https://prodx-backend-production.up.railway.app/api/auth/login', {
        email: 'admin@prodx.com',
        password: 'Admin123'
      }, {
        headers: {
          'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app'
        }
      });
      console.log('✅ Auth login endpoint accessible');
      console.log('Login response:', loginResponse.data);
    } catch (loginError) {
      if (loginError.response) {
        // This is expected for invalid credentials
        console.log('✅ Auth login endpoint accessible (returned status:', loginError.response.status, ')');
        console.log('Login response data:', loginError.response.data);
      } else {
        console.log('❌ Auth login endpoint not accessible');
        console.log('Login error:', loginError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Server test failed');
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else {
      console.log('Error message:', error.message);
    }
  }
}

testServer();