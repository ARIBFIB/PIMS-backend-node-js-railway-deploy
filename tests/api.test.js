const axios = require('axios');
const bcrypt = require('bcryptjs');

// Base URL for the API
const BASE_URL = 'http://localhost:4000';
const API_TIMEOUT = 10000;

// Test user credentials
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Test data
const TEST_MATERIAL = {
  name: 'Test Material',
  unit: 'kg',
  quantity: 100,
  unitPrice: 50,
  lowStockThreshold: 20
};

const TEST_RECIPE = {
  name: 'Test Recipe',
  category: 'Test Category',
  ingredients: [
    {
      materialId: 1,
      quantity: 10
    }
  ]
};

const TEST_PRODUCTION = {
  recipeId: 1,
  quantityProduced: 50
};

let authToken = null;
let testMaterialId = null;
let testRecipeId = null;

// Axios instance with timeout
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT
});

// Function to check if database is accessible
async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  try {
    // Try to access health endpoint first
    const healthResponse = await apiClient.get('/health');
    if (healthResponse.status === 200) {
      console.log('✓ Server is running\n');
      return true;
    }
  } catch (error) {
    console.log('✗ Server is not accessible. Please make sure the server is running on port 4000\n');
    return false;
  }
}

// Helper function to make authenticated requests
const authenticatedRequest = async (method, url, data = null) => {
  const config = {
    method,
    url,
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return await apiClient(config);
};

console.log('=== PIMS Backend API Testing ===\n');

// Test 1: Health check
async function testHealthCheck() {
  console.log('1. Testing Health Check Endpoint...');
  try {
    const response = await apiClient.get('/health');
    if (response.status === 200 && response.data.status === 'OK') {
      console.log('✓ Health check passed\n');
      return true;
    } else {
      console.log('✗ Health check failed\n');
      return false;
    }
  } catch (error) {
    console.log('✗ Health check failed:', error.message, '\n');
    return false;
  }
}

// Test 2: Authentication
async function testAuthentication() {
  console.log('2. Testing Authentication...');
  try {
    const response = await apiClient.post('/api/auth/login', TEST_USER);
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✓ Authentication successful\n');
      return true;
    } else {
      console.log('✗ Authentication failed\n');
      return false;
    }
  } catch (error) {
    console.log('✗ Authentication failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test 3: Materials API
async function testMaterialsAPI() {
  console.log('3. Testing Materials API...');
  
  try {
    // Create a new material
    const createResponse = await authenticatedRequest('post', '/api/materials', TEST_MATERIAL);
    if (createResponse.status === 201 && createResponse.data.material && createResponse.data.material.id) {
      testMaterialId = createResponse.data.material.id;
      console.log('✓ Material creation successful');
    } else {
      console.log('✗ Material creation failed');
      return false;
    }
    
    // Get all materials
    const getAllResponse = await authenticatedRequest('get', '/api/materials');
    if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
      console.log('✓ Get all materials successful');
    } else {
      console.log('✗ Get all materials failed');
      return false;
    }
    
    // Get material by ID
    const getByIdResponse = await authenticatedRequest('get', `/api/materials/${testMaterialId}`);
    if (getByIdResponse.status === 200 && getByIdResponse.data.id === testMaterialId) {
      console.log('✓ Get material by ID successful');
    } else {
      console.log('✗ Get material by ID failed');
      return false;
    }
    
    // Get low stock items
    const lowStockResponse = await authenticatedRequest('get', '/api/materials/low-stock');
    if (lowStockResponse.status === 200 && Array.isArray(lowStockResponse.data)) {
      console.log('✓ Get low stock items successful');
    } else {
      console.log('✗ Get low stock items failed');
      return false;
    }
    
    // Update material
    const updateData = {
      quantity: 150,
      unitPrice: 55,
      lowStockThreshold: 25
    };
    const updateResponse = await authenticatedRequest('put', `/api/materials/${testMaterialId}`, updateData);
    if (updateResponse.status === 200) {
      console.log('✓ Material update successful');
    } else {
      console.log('✗ Material update failed');
      return false;
    }
    
    console.log('✓ All materials API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Materials API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test 4: Recipes API
async function testRecipesAPI() {
  console.log('4. Testing Recipes API...');
  
  try {
    // Create a new recipe
    const createResponse = await authenticatedRequest('post', '/api/recipes', TEST_RECIPE);
    if (createResponse.status === 201 && createResponse.data.recipe && createResponse.data.recipe.id) {
      testRecipeId = createResponse.data.recipe.id;
      console.log('✓ Recipe creation successful');
    } else {
      console.log('✗ Recipe creation failed');
      return false;
    }
    
    // Get all recipes
    const getAllResponse = await authenticatedRequest('get', '/api/recipes');
    if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
      console.log('✓ Get all recipes successful');
    } else {
      console.log('✗ Get all recipes failed');
      return false;
    }
    
    // Get recipe by ID
    const getByIdResponse = await authenticatedRequest('get', `/api/recipes/${testRecipeId}`);
    if (getByIdResponse.status === 200 && getByIdResponse.data.id === testRecipeId) {
      console.log('✓ Get recipe by ID successful');
    } else {
      console.log('✗ Get recipe by ID failed');
      return false;
    }
    
    // Calculate recipe materials
    const calcResponse = await authenticatedRequest('get', `/api/recipes/${testRecipeId}/calc?qty=1`);
    if (calcResponse.status === 200) {
      console.log('✓ Recipe materials calculation successful');
    } else {
      console.log('✗ Recipe materials calculation failed');
      return false;
    }
    
    // Update recipe
    const updateData = {
      name: 'Updated Test Recipe',
      category: 'Updated Category',
      ingredients: [
        {
          materialId: testMaterialId,
          quantity: 15
        }
      ]
    };
    const updateResponse = await authenticatedRequest('put', `/api/recipes/${testRecipeId}`, updateData);
    if (updateResponse.status === 200 && updateResponse.data.recipe && updateResponse.data.recipe.name === 'Updated Test Recipe') {
      console.log('✓ Recipe update successful');
    } else {
      console.log('✗ Recipe update failed');
      return false;
    }
    
    // Delete recipe
    const deleteResponse = await authenticatedRequest('delete', `/api/recipes/${testRecipeId}`);
    if (deleteResponse.status === 200) {
      console.log('✓ Recipe deletion successful');
      testRecipeId = null; // Clear the ID since it's deleted
    } else {
      console.log('✗ Recipe deletion failed');
      return false;
    }
    
    console.log('✓ All recipes API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Recipes API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test 5: Production Logs API
async function testProductionLogsAPI() {
  console.log('5. Testing Production Logs API...');
  
  try {
    // Create a new production log
    const productionData = {
      recipeId: testRecipeId || 1,
      quantityProduced: 50
    };
    const createResponse = await authenticatedRequest('post', '/api/production-logs', productionData);
    if (createResponse.status === 201 && createResponse.data.log && createResponse.data.log.id) {
      const productionLogId = createResponse.data.log.id;
      console.log('✓ Production log creation successful');
    } else {
      console.log('✗ Production log creation failed');
      return false;
    }
    
    // Get all production logs
    const getAllResponse = await authenticatedRequest('get', '/api/production-logs');
    if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
      console.log('✓ Get all production logs successful');
    } else {
      console.log('✗ Get all production logs failed');
      return false;
    }
    
    console.log('✓ All production logs API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Production logs API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test 6: Reports API
async function testReportsAPI() {
  console.log('6. Testing Reports API...');
  
  try {
    // Get production report
    const productionResponse = await authenticatedRequest('get', '/api/reports/production');
    if (productionResponse.status === 200) {
      console.log('✓ Production report retrieval successful');
    } else {
      console.log('✗ Production report retrieval failed');
      return false;
    }
    
    // Get inventory report
    const inventoryResponse = await authenticatedRequest('get', '/api/reports/inventory');
    if (inventoryResponse.status === 200) {
      console.log('✓ Inventory report retrieval successful');
    } else {
      console.log('✗ Inventory report retrieval failed');
      return false;
    }
    
    // Get export report
    const exportResponse = await authenticatedRequest('get', '/api/reports/export?type=inventory&format=excel');
    if (exportResponse.status === 200) {
      console.log('✓ Export report retrieval successful');
    } else {
      console.log('✗ Export report retrieval failed');
      return false;
    }
    
    console.log('✓ All reports API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Reports API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting API tests...\n');
  
  // Check database connection first
  const isDatabaseAccessible = await checkDatabaseConnection();
  if (!isDatabaseAccessible) {
    console.log('Cannot proceed with tests due to database connectivity issues.\n');
    return false;
  }
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Materials API', fn: testMaterialsAPI },
    { name: 'Recipes API', fn: testRecipesAPI },
    { name: 'Production Logs API', fn: testProductionLogsAPI },
    { name: 'Reports API', fn: testReportsAPI }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      if (passed) {
        passedTests++;
      }
    } catch (error) {
      console.log(`✗ ${test.name} failed with error:`, error.message, '\n');
    }
  }
  
  console.log(`=== Test Results ===`);
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed.');
    return false;
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test suite failed with error:', error);
  process.exit(1);
});