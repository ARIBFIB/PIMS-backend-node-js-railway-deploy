require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:4000/api';

// Test user credentials
const TEST_ADMIN = {
  email: 'admin@prodx.com',
  password: 'Admin123'
};

const TEST_STAFF = {
  email: 'staff@prodx.com',
  password: 'Staff123'
};

let adminToken = '';
let staffToken = '';

// Function to test an API endpoint
async function testEndpoint(method, url, description, token = null, data = null) {
  try {
    const config = {
      method,
      url,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`✅ ${description} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    const status = error.response ? error.response.status : 'Network Error';
    const message = error.response ? error.response.data.message || error.response.data : error.message;
    console.log(`❌ ${description} - Status: ${status} - Error: ${message}`);
    return null;
  }
}

// Authentication tests
async function testAuthAPIs() {
  console.log('\n=== Authentication API Tests ===');
  
  // Login as admin
  const adminLoginResponse = await testEndpoint('POST', `${BASE_URL}/auth/login`, 'Admin Login', null, TEST_ADMIN);
  if (adminLoginResponse && adminLoginResponse.success) {
    adminToken = adminLoginResponse.data.token;
  }
  
  // Login as staff
  const staffLoginResponse = await testEndpoint('POST', `${BASE_URL}/auth/login`, 'Staff Login', null, TEST_STAFF);
  if (staffLoginResponse && staffLoginResponse.success) {
    staffToken = staffLoginResponse.data.token;
  }
  
  // Get profile (admin)
  if (adminToken) {
    await testEndpoint('GET', `${BASE_URL}/auth/profile`, 'Get Admin Profile', adminToken);
  }
  
  // Get profile (staff)
  if (staffToken) {
    await testEndpoint('GET', `${BASE_URL}/auth/profile`, 'Get Staff Profile', staffToken);
  }
}

// Inventory API tests
async function testInventoryAPIs() {
  console.log('\n=== Inventory API Tests ===');
  
  if (!adminToken || !staffToken) {
    console.log('Skipping inventory tests - not authenticated');
    return;
  }
  
  // Get all inventory items
  await testEndpoint('GET', `${BASE_URL}/inventory`, 'Get All Inventory Items', adminToken);
  
  // Get inventory categories
  await testEndpoint('GET', `${BASE_URL}/inventory/categories`, 'Get Inventory Categories', adminToken);
  
  // Get low stock items
  await testEndpoint('GET', `${BASE_URL}/inventory/low-stock`, 'Get Low Stock Items', adminToken);
  
  // Create inventory item (admin)
  const newItem = {
    name: 'Test Item',
    description: 'Test item for API testing',
    quantity: 100,
    unit: 'pcs',
    category: 'Test Category',
    location: 'Test Location',
    minStockLevel: 20,
    price: 29.99
  };
  
  const createResponse = await testEndpoint('POST', `${BASE_URL}/inventory`, 'Create Inventory Item', adminToken, newItem);
  let itemId = null;
  if (createResponse && createResponse.success) {
    itemId = createResponse.data.id;
  }
  
  // Get inventory item by ID
  if (itemId) {
    await testEndpoint('GET', `${BASE_URL}/inventory/${itemId}`, 'Get Inventory Item by ID', adminToken);
    
    // Update inventory item
    const updateData = {
      name: 'Updated Test Item',
      description: 'Updated test item for API testing',
      quantity: 150,
      unit: 'pcs',
      category: 'Test Category',
      location: 'Updated Location',
      minStockLevel: 30,
      price: 39.99
    };
    await testEndpoint('PUT', `${BASE_URL}/inventory/${itemId}`, 'Update Inventory Item', adminToken, updateData);
    
    // Delete inventory item
    await testEndpoint('DELETE', `${BASE_URL}/inventory/${itemId}`, 'Delete Inventory Item', adminToken);
  }
}

// Production API tests
async function testProductionAPIs() {
  console.log('\n=== Production API Tests ===');
  
  if (!adminToken || !staffToken) {
    console.log('Skipping production tests - not authenticated');
    return;
  }
  
  // Get all work orders
  await testEndpoint('GET', `${BASE_URL}/production`, 'Get All Work Orders', adminToken);
  
  // Get calendar data
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  await testEndpoint('GET', `${BASE_URL}/production/calendar?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`, 'Get Calendar Data', adminToken);
  
  // Create work order
  const newWorkOrder = {
    title: 'Test Work Order',
    description: 'Test work order for API testing',
    priority: 'medium',
    assignedTo: 1,
    dueDate: formatDate(endDate),
    status: 'pending',
    inventoryItems: []
  };
  
  const createResponse = await testEndpoint('POST', `${BASE_URL}/production`, 'Create Work Order', staffToken, newWorkOrder);
  let workOrderId = null;
  if (createResponse && createResponse.success) {
    workOrderId = createResponse.data.id;
  }
  
  // Get work order by ID
  if (workOrderId) {
    await testEndpoint('GET', `${BASE_URL}/production/${workOrderId}`, 'Get Work Order by ID', adminToken);
    
    // Update work order
    const updateData = {
      title: 'Updated Test Work Order',
      description: 'Updated test work order for API testing',
      priority: 'high',
      assignedTo: 1,
      dueDate: formatDate(endDate),
      status: 'in_progress'
    };
    await testEndpoint('PUT', `${BASE_URL}/production/${workOrderId}`, 'Update Work Order', staffToken, updateData);
    
    // Delete work order
    await testEndpoint('DELETE', `${BASE_URL}/production/${workOrderId}`, 'Delete Work Order', adminToken);
  }
}

// Analytics API tests
async function testAnalyticsAPIs() {
  console.log('\n=== Analytics API Tests ===');
  
  if (!adminToken) {
    console.log('Skipping analytics tests - not authenticated as admin');
    return;
  }
  
  // Get summary
  await testEndpoint('GET', `${BASE_URL}/analytics/summary`, 'Get Analytics Summary', adminToken);
  
  // Get production trend
  await testEndpoint('GET', `${BASE_URL}/analytics/production-trend?days=30`, 'Get Production Trend', adminToken);
  
  // Get inventory value
  await testEndpoint('GET', `${BASE_URL}/analytics/inventory-value`, 'Get Inventory Value', adminToken);
}

// Users API tests
async function testUsersAPIs() {
  console.log('\n=== Users API Tests ===');
  
  if (!adminToken) {
    console.log('Skipping users tests - not authenticated as admin');
    return;
  }
  
  // Get all users
  await testEndpoint('GET', `${BASE_URL}/users`, 'Get All Users', adminToken);
  
  // We won't test creating/updating/deleting users to avoid modifying the test environment
}

// Recipes API tests
async function testRecipesAPIs() {
  console.log('\n=== Recipes API Tests ===');
  
  if (!adminToken && !staffToken) {
    console.log('Skipping recipes tests - not authenticated');
    return;
  }
  
  // Get all recipes
  await testEndpoint('GET', `${BASE_URL}/recipes`, 'Get All Recipes', adminToken);
  
  // Get recipe categories
  await testEndpoint('GET', `${BASE_URL}/recipes/categories`, 'Get Recipe Categories', adminToken);
  
  // Create recipe
  const newRecipe = {
    name: 'Test Recipe',
    description: 'Test recipe for API testing',
    category: 'Test',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'medium',
    instructions: ['Step 1', 'Step 2', 'Step 3'],
    ingredients: [
      {
        inventoryId: 1,
        quantity: 2,
        unit: 'pieces'
      }
    ],
    additionalCosts: [],
    notes: 'Test notes'
  };
  
  const createResponse = await testEndpoint('POST', `${BASE_URL}/recipes`, 'Create Recipe', staffToken, newRecipe);
  let recipeId = null;
  if (createResponse && createResponse.success) {
    recipeId = createResponse.data.id;
  }
  
  // Get recipe by ID
  if (recipeId) {
    await testEndpoint('GET', `${BASE_URL}/recipes/${recipeId}`, 'Get Recipe by ID', adminToken);
    
    // Update recipe
    const updateData = {
      name: 'Updated Test Recipe',
      description: 'Updated test recipe for API testing',
      category: 'Test',
      prepTime: 20,
      cookTime: 35,
      servings: 6,
      difficulty: 'hard',
      instructions: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
      ingredients: [
        {
          inventoryId: 1,
          quantity: 3,
          unit: 'pieces'
        }
      ],
      additionalCosts: [],
      notes: 'Updated test notes'
    };
    await testEndpoint('PUT', `${BASE_URL}/recipes/${recipeId}`, 'Update Recipe', staffToken, updateData);
    
    // Delete recipe
    await testEndpoint('DELETE', `${BASE_URL}/recipes/${recipeId}`, 'Delete Recipe', adminToken);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting API tests...\n');
  
  await testAuthAPIs();
  await testInventoryAPIs();
  await testProductionAPIs();
  await testAnalyticsAPIs();
  await testUsersAPIs();
  await testRecipesAPIs();
  
  console.log('\n=== API Testing Complete ===');
}

runAllTests();