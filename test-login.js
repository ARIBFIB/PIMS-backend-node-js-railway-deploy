require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@prodx.com',
      password: 'Admin123'
    });
    
    console.log('Login successful!');
    console.log('Token:', response.data.data.token);
    return response.data.data.token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
  }
}

testLogin();