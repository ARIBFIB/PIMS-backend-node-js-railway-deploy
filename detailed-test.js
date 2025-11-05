// Detailed test to diagnose the issue
const axios = require('axios');

async function detailedTest() {
  try {
    console.log('Performing detailed API test...');
    console.log('Using your new Railway domain: pims-backend-node-js-railway-deploy-production.up.railway.app');
    
    // Test with different approaches
    const urlsToTest = [
      'https://pims-backend-node-js-railway-deploy-production.up.railway.app/health',
      'https://pims-backend-node-js-railway-deploy-production.up.railway.app/api/auth/login',
      'https://pims-backend-node-js-railway-deploy-production.up.railway.app/',
      'https://pims-backend-node-js-railway-deploy-production.up.railway.app/api/auth',
      'https://pims-backend-node-js-railway-deploy-production.up.railway.app/api'
    ];
    
    for (const url of urlsToTest) {
      try {
        console.log(`\nTesting: ${url}`);
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app'
          }
        });
        console.log(`✅ Success - Status: ${response.status}`);
        if (response.data) {
          console.log(`Response:`, JSON.stringify(response.data, null, 2));
        }
      } catch (error) {
        if (error.response) {
          console.log(`ℹ️  Got response - Status: ${error.response.status}`);
          if (error.response.data) {
            console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
          }
        } else if (error.request) {
          console.log(`❌ No response - Error: ${error.message}`);
        } else {
          console.log(`❌ Request error - Error: ${error.message}`);
        }
      }
    }
    
    // Test POST request
    console.log('\nTesting POST request to login endpoint...');
    try {
      const postResponse = await axios.post('https://pims-backend-node-js-railway-deploy-production.up.railway.app/api/auth/login', {
        email: 'admin@prodx.com',
        password: 'Admin123'
      }, {
        timeout: 15000,
        headers: {
          'Origin': 'https://inquisitive-cannoli-1a02dc.netlify.app',
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ POST Success - Status: ${postResponse.status}`);
      console.log(`Response:`, JSON.stringify(postResponse.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log(`ℹ️  POST Got response - Status: ${error.response.status}`);
        if (error.response.data) {
          console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
        }
      } else if (error.request) {
        console.log(`❌ POST No response - Error: ${error.message}`);
      } else {
        console.log(`❌ POST Request error - Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Detailed test failed');
    console.log('Error:', error.message);
  }
}

detailedTest();