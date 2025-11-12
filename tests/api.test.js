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

// Helper function for additional API requests (used in extended tests)
const apiRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: BASE_URL + url,
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return await axios(config);
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
    // First create a simple recipe that doesn't require scarce materials
    const simpleRecipe = {
      name: 'Simple Test Recipe',
      category: 'Test Category',
      ingredients: [
        {
          materialId: testMaterialId, // Use the test material we created earlier
          quantity: 1
        }
      ]
    };
    
    const recipeResponse = await authenticatedRequest('post', '/api/recipes', simpleRecipe);
    if (recipeResponse.status !== 201 || !recipeResponse.data.recipe || !recipeResponse.data.recipe.id) {
      console.log('✗ Failed to create test recipe for production log');
      return false;
    }
    
    const testRecipeId = recipeResponse.data.recipe.id;
    console.log('✓ Created test recipe for production log');
    
    // Create a new production log using our test recipe
    const productionData = {
      recipeId: testRecipeId,
      quantityProduced: 1
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
    
    // Note: We're not cleaning up the test recipe because it's referenced by production logs
    // This is expected behavior - you can't delete a recipe that has production logs
    console.log('✓ Test recipe not deleted (has production logs referencing it)');
    
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

// Test UOM endpoints
async function testUOMEndpoints() {
  console.log('7. Testing UOM Endpoints...');
  
  try {
    // Test creating a UOM
    const uomData = {
      name: 'Pound',
      symbol: 'lb'
    };
    
    const uomResponse = await apiRequest('POST', '/api/uom', uomData);
    console.log('Create UOM Response:', uomResponse.data);
    
    const uomId = uomResponse.data.uom.id;
    
    // Test getting all UOMs
    const allUOMsResponse = await apiRequest('GET', '/api/uom');
    console.log('Get All UOMs Response:', allUOMsResponse.data);
    
    // Test getting a specific UOM
    const singleUOMResponse = await apiRequest('GET', `/api/uom/${uomId}`);
    console.log('Get Single UOM Response:', singleUOMResponse.data);
    
    // Test updating a UOM
    const updatedUomData = {
      name: 'Pound (updated)',
      symbol: 'lbs'
    };
    
    const updateUOMResponse = await apiRequest('PUT', `/api/uom/${uomId}`, updatedUomData);
    console.log('Update UOM Response:', updateUOMResponse.data);
    
    // Test deleting a UOM
    const deleteUOMResponse = await apiRequest('DELETE', `/api/uom/${uomId}`);
    console.log('Delete UOM Response:', deleteUOMResponse.data);
    
    console.log('✓ All UOM API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ UOM API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test Category endpoints
async function testCategoryEndpoints() {
  console.log('8. Testing Category Endpoints...');
  
  try {
    // Test creating a category
    const categoryData = {
      name: 'Chemicals'
    };
    
    const categoryResponse = await apiRequest('POST', '/api/categories', categoryData);
    console.log('Create Category Response:', categoryResponse.data);
    
    const categoryId = categoryResponse.data.category.id;
    
    // Test getting all categories
    const allCategoriesResponse = await apiRequest('GET', '/api/categories');
    console.log('Get All Categories Response:', allCategoriesResponse.data);
    
    // Test getting a specific category
    const singleCategoryResponse = await apiRequest('GET', `/api/categories/${categoryId}`);
    console.log('Get Single Category Response:', singleCategoryResponse.data);
    
    // Test updating a category
    const updatedCategoryData = {
      name: 'Chemicals (updated)'
    };
    
    const updateCategoryResponse = await apiRequest('PUT', `/api/categories/${categoryId}`, updatedCategoryData);
    console.log('Update Category Response:', updateCategoryResponse.data);
    
    // Test deleting a category
    const deleteCategoryResponse = await apiRequest('DELETE', `/api/categories/${categoryId}`);
    console.log('Delete Category Response:', deleteCategoryResponse.data);
    
    console.log('✓ All Category API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Category API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test Supplier endpoints
async function testSupplierEndpoints() {
  console.log('9. Testing Supplier Endpoints...');
  
  try {
    // Test creating a supplier
    const supplierData = {
      name: 'Test Supplier',
      contact: 'Test Contact',
      email: 'test@supplier.com',
      phone: '123-456-7890',
      address: '123 Test St, Test City, TC 12345'
    };
    
    const supplierResponse = await apiRequest('POST', '/api/suppliers', supplierData);
    console.log('Create Supplier Response:', supplierResponse.data);
    
    const supplierId = supplierResponse.data.supplier.id;
    
    // Test getting all suppliers
    const allSuppliersResponse = await apiRequest('GET', '/api/suppliers');
    console.log('Get All Suppliers Response:', allSuppliersResponse.data);
    
    // Test getting a specific supplier
    const singleSupplierResponse = await apiRequest('GET', `/api/suppliers/${supplierId}`);
    console.log('Get Single Supplier Response:', singleSupplierResponse.data);
    
    // Test updating a supplier
    const updatedSupplierData = {
      name: 'Test Supplier (updated)',
      contact: 'Updated Contact',
      email: 'updated@supplier.com',
      phone: '098-765-4321',
      address: '456 Updated Ave, Updated City, UC 67890'
    };
    
    const updateSupplierResponse = await apiRequest('PUT', `/api/suppliers/${supplierId}`, updatedSupplierData);
    console.log('Update Supplier Response:', updateSupplierResponse.data);
    
    // Test deleting a supplier
    const deleteSupplierResponse = await apiRequest('DELETE', `/api/suppliers/${supplierId}`);
    console.log('Delete Supplier Response:', deleteSupplierResponse.data);
    
    console.log('✓ All Supplier API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Supplier API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test Customer endpoints
async function testCustomerEndpoints() {
  console.log('10. Testing Customer Endpoints...');
  
  try {
    // Test creating a customer
    const customerData = {
      name: 'Test Customer',
      email: 'test@customer.com',
      phone: '123-456-7890',
      address: '123 Test St, Test City, TC 12345'
    };
    
    const customerResponse = await apiRequest('POST', '/api/customers', customerData);
    console.log('Create Customer Response:', customerResponse.data);
    
    const customerId = customerResponse.data.customer.id;
    
    // Test getting all customers
    const allCustomersResponse = await apiRequest('GET', '/api/customers');
    console.log('Get All Customers Response:', allCustomersResponse.data);
    
    // Test getting a specific customer
    const singleCustomerResponse = await apiRequest('GET', `/api/customers/${customerId}`);
    console.log('Get Single Customer Response:', singleCustomerResponse.data);
    
    // Test updating a customer
    const updatedCustomerData = {
      name: 'Test Customer (updated)',
      email: 'updated@customer.com',
      phone: '098-765-4321',
      address: '456 Updated Ave, Updated City, UC 67890'
    };
    
    const updateCustomerResponse = await apiRequest('PUT', `/api/customers/${customerId}`, updatedCustomerData);
    console.log('Update Customer Response:', updateCustomerResponse.data);
    
    // Test deleting a customer
    const deleteCustomerResponse = await apiRequest('DELETE', `/api/customers/${customerId}`);
    console.log('Delete Customer Response:', deleteCustomerResponse.data);
    
    console.log('✓ All Customer API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Customer API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test Purchase Order endpoints
async function testPurchaseOrderEndpoints() {
  console.log('11. Testing Purchase Order Endpoints...');
  
  try {
    // First get suppliers and materials to use in the purchase order
    const suppliersResponse = await apiRequest('GET', '/api/suppliers');
    const materialsResponse = await apiRequest('GET', '/api/materials');
    
    if (suppliersResponse.data.length === 0 || materialsResponse.data.length === 0) {
      console.log('No suppliers or materials available for testing purchase orders');
      console.log('✓ Purchase Order API tests skipped\n');
      return true;
    }
    
    const supplierId = suppliersResponse.data[0].id;
    const materialId = materialsResponse.data[0].id;
    
    // Test creating a purchase order
    const purchaseOrderData = {
      supplierId: supplierId,
      items: [
        {
          materialId: materialId,
          quantity: 10,
          unitPrice: 5.50
        }
      ]
    };
    
    const purchaseOrderResponse = await apiRequest('POST', '/api/purchase-orders', purchaseOrderData);
    console.log('Create Purchase Order Response:', purchaseOrderResponse.data);
    
    const purchaseOrderId = purchaseOrderResponse.data.order.id;
    
    // Test getting all purchase orders
    const allPurchaseOrdersResponse = await apiRequest('GET', '/api/purchase-orders');
    console.log('Get All Purchase Orders Response:', allPurchaseOrdersResponse.data);
    
    // Test getting a specific purchase order
    const singlePurchaseOrderResponse = await apiRequest('GET', `/api/purchase-orders/${purchaseOrderId}`);
    console.log('Get Single Purchase Order Response:', singlePurchaseOrderResponse.data);
    
    // Test updating a purchase order
    const updatedPurchaseOrderData = {
      supplierId: supplierId,
      items: [
        {
          materialId: materialId,
          quantity: 15,
          unitPrice: 6.00
        }
      ]
    };
    
    const updatePurchaseOrderResponse = await apiRequest('PUT', `/api/purchase-orders/${purchaseOrderId}`, updatedPurchaseOrderData);
    console.log('Update Purchase Order Response:', updatePurchaseOrderResponse.data);
    
    // Test approving a purchase order
    const approvePurchaseOrderResponse = await apiRequest('PATCH', `/api/purchase-orders/${purchaseOrderId}/approve`);
    console.log('Approve Purchase Order Response:', approvePurchaseOrderResponse.data);
    
    // Note: After approval, the order cannot be updated or deleted, so we'll test deletion with a new order
    
    // Create another purchase order for deletion test
    const newPurchaseOrderResponse = await apiRequest('POST', '/api/purchase-orders', purchaseOrderData);
    const newPurchaseOrderId = newPurchaseOrderResponse.data.order.id;
    
    // Test deleting a purchase order
    const deletePurchaseOrderResponse = await apiRequest('DELETE', `/api/purchase-orders/${newPurchaseOrderId}`);
    console.log('Delete Purchase Order Response:', deletePurchaseOrderResponse.data);
    
    console.log('✓ All Purchase Order API tests passed\n');
    return true;
  } catch (error) {
    console.log('✗ Purchase Order API test failed:', error.message);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n');
    return false;
  }
}

// Test Low Stock Report endpoint
async function testLowStockReportEndpoint() {
  console.log('12. Testing Low Stock Report Endpoint...');
  
  try {
    const lowStockResponse = await apiRequest('GET', '/api/reports/lowstock');
    console.log('Low Stock Report Response:', lowStockResponse.data);
    console.log('✓ Low Stock Report API test passed\n');
    return true;
  } catch (error) {
    console.log('✗ Low Stock Report API test failed:', error.message);
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
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Materials API', fn: testMaterialsAPI },
    { name: 'Recipes API', fn: testRecipesAPI },
    { name: 'Production Logs API', fn: testProductionLogsAPI },
    { name: 'Reports API', fn: testReportsAPI },
    { name: 'UOM API', fn: testUOMEndpoints },
    { name: 'Category API', fn: testCategoryEndpoints },
    { name: 'Supplier API', fn: testSupplierEndpoints },
    { name: 'Customer API', fn: testCustomerEndpoints },
    { name: 'Purchase Order API', fn: testPurchaseOrderEndpoints },
    { name: 'Low Stock Report API', fn: testLowStockReportEndpoint }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`=== Running ${test.name} ===`);
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