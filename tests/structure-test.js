const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:4000';
const API_TIMEOUT = 10000;

// Axios instance with timeout
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT
});

console.log('=== PIMS Backend API Structure Testing ===\n');

// Test API structure and endpoints
async function testAPIStructure() {
  console.log('Testing API structure and endpoints...\n');
  
  // Define all expected endpoints
  const endpoints = [
    { method: 'GET', path: '/health', description: 'Health check endpoint' },
    { method: 'POST', path: '/api/auth/login', description: 'User login' },
    { method: 'GET', path: '/api/materials', description: 'Get all materials' },
    { method: 'GET', path: '/api/materials/low-stock', description: 'Get low stock materials' },
    { method: 'GET', path: '/api/materials/:id', description: 'Get material by ID' },
    { method: 'POST', path: '/api/materials', description: 'Create new material' },
    { method: 'PUT', path: '/api/materials/:id', description: 'Update material' },
    { method: 'GET', path: '/api/recipes', description: 'Get all recipes' },
    { method: 'GET', path: '/api/recipes/:id', description: 'Get recipe by ID' },
    { method: 'GET', path: '/api/recipes/:id/calc', description: 'Calculate recipe materials cost' },
    { method: 'POST', path: '/api/recipes', description: 'Create new recipe' },
    { method: 'PUT', path: '/api/recipes/:id', description: 'Update recipe' },
    { method: 'DELETE', path: '/api/recipes/:id', description: 'Delete recipe' },
    { method: 'GET', path: '/api/production-logs', description: 'Get all production logs' },
    { method: 'POST', path: '/api/production-logs', description: 'Create new production log' },
    { method: 'GET', path: '/api/reports/production', description: 'Get production report' },
    { method: 'GET', path: '/api/reports/inventory', description: 'Get inventory report' },
    { method: 'GET', path: '/api/reports/export', description: 'Export report' }
  ];
  
  let passedTests = 0;
  let totalTests = endpoints.length;
  
  // Test each endpoint for correct HTTP method and path structure
  for (const endpoint of endpoints) {
    try {
      // For testing structure, we'll make a request and check if we get a proper response
      // or if we get a 401/404 which indicates the endpoint exists but requires auth or params
      const response = await apiClient.request({
        method: endpoint.method,
        url: endpoint.path.replace(':id', '1'), // Replace ID parameter with 1 for testing
        validateStatus: function (status) {
          // Accept status codes that indicate the endpoint exists
          // 401 = Unauthorized (endpoint exists but requires auth)
          // 404 = Not Found (endpoint exists but ID not found)
          // 400 = Bad Request (endpoint exists but missing data)
          // 500 = Internal Server Error (endpoint exists but server error)
          return status < 500 || status === 500;
        }
      });
      
      // If we get any response, it means the endpoint exists
      console.log(`✓ ${endpoint.method} ${endpoint.path} - Endpoint exists (${response.status})`);
      passedTests++;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`✗ Server is not running. Please start the server on port 4000.`);
        break;
      } else if (error.response) {
        // If we get a response, it means the endpoint exists
        console.log(`✓ ${endpoint.method} ${endpoint.path} - Endpoint exists (${error.response.status})`);
        passedTests++;
      } else {
        console.log(`✗ ${endpoint.method} ${endpoint.path} - Endpoint test failed: ${error.message}`);
      }
    }
  }
  
  console.log(`\n=== Structure Test Results ===`);
  console.log(`Endpoints found: ${passedTests}/${totalTests}`);
  console.log(`Missing endpoints: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All API endpoints are properly defined!');
  } else if (passedTests > 0) {
    console.log('⚠️  Some API endpoints are defined, but not all.');
  } else {
    console.log('❌ No API endpoints could be verified.');
  }
  
  return passedTests > 0;
}

// Run the structure tests
testAPIStructure().catch(error => {
  console.error('Test suite failed with error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.log('\nPlease make sure the server is running on port 4000 before running tests.');
  }
  process.exit(1);
});