// Test API endpoints
const axios = require('axios');

async function testApiEndpoints() {
  try {
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get('https://prodx-backend-production.up.railway.app/health');
      console.log('✅ Health endpoint working');
      console.log('Status:', healthResponse.status);
      console.log('Data:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health endpoint failed');
      console.log('Error:', error.message);
    }
    
    // Test auth login endpoint
    try {
      const loginResponse = await axios.post('https://prodx-backend-production.up.railway.app/api/auth/login', {
        email: 'admin@prodx.com',
        password: 'Admin123'
      }, {
        headers: {
          'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Auth login endpoint working');
      console.log('Status:', loginResponse.status);
      console.log('Data:', loginResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('✅ Auth login endpoint accessible (status:', error.response.status, ')');
        console.log('Response data:', error.response.data);
      } else {
        console.log('❌ Auth login endpoint failed');
        console.log('Error:', error.message);
      }
    }
    
    // Test auth register endpoint
    try {
      const registerResponse = await axios.post('https://prodx-backend-production.up.railway.app/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234',
        confirmPassword: 'Test1234'
      }, {
        headers: {
          'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Auth register endpoint working');
      console.log('Status:', registerResponse.status);
    } catch (error) {
      if (error.response) {
        console.log('✅ Auth register endpoint accessible (status:', error.response.status, ')');
      } else {
        console.log('❌ Auth register endpoint failed');
        console.log('Error:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ API endpoint test failed');
    console.log('Error:', error.message);
  }
}

testApiEndpoints();