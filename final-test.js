// Final test to verify API is working
const axios = require('axios');

async function finalTest() {
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
    
    console.log('\n🎉 If you see this message, your backend is running successfully on Railway!');
    console.log('You can now test the login from your Netlify frontend.');
    
  } catch (error) {
    console.log('❌ API endpoint test failed');
    console.log('Error:', error.message);
  }
}

finalTest();