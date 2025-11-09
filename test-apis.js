const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';
const SERVER_BASE = 'http://localhost:4000';

async function testAPIs() {
  console.log('Testing Backend APIs...\n');
  
  try {
    // Test health check endpoint
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get(`${SERVER_BASE}/health`);
    console.log('✓ Health check:', healthResponse.data);
    
    // Test login
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✓ Login successful');
    console.log('  Token:', loginResponse.data.token.substring(0, 20) + '...');
    console.log('  User:', loginResponse.data.user);
    
    const token = loginResponse.data.token;
    
    // Test materials endpoints with authentication
    console.log('\n3. Testing materials endpoints...');
    const materialsResponse = await axios.get(`${API_BASE}/materials`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Materials fetched:', materialsResponse.data.length, 'items');
    
    // Test recipes endpoints with authentication
    console.log('\n4. Testing recipes endpoints...');
    const recipesResponse = await axios.get(`${API_BASE}/recipes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Recipes fetched:', recipesResponse.data.length, 'items');
    
    // Test low stock items
    console.log('\n5. Testing low stock items endpoint...');
    const lowStockResponse = await axios.get(`${API_BASE}/materials/low-stock`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Low stock items fetched:', lowStockResponse.data.length, 'items');
    
    console.log('\n✅ All API tests passed!');
  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
  }
}

testAPIs();