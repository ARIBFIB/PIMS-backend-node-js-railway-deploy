const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let adminToken = '';
let staffToken = '';
let createdInventoryId = null;
let createdWorkOrderId = null;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName, status, details = '') => {
  const symbol = status ? '✓' : '✗';
  const color = status ? 'green' : 'red';
  log(`${symbol} ${testName}`, color);
  if (details) {
    log(`  ${details}`, 'yellow');
  }
  results.tests.push({ testName, status, details });
  if (status) results.passed++;
  else results.failed++;
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testAuthRegister() {
  log('\n=== Testing Auth - Register ===', 'cyan');
  
  try {
    // Test 1: Register admin
    const adminRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Admin',
      email: 'testadmin@test.com',
      password: 'Admin123',
      confirmPassword: 'Admin123'
    });
    logTest('Register Admin', adminRes.data.success, `Created user: ${adminRes.data.data?.user?.email}`);
    
    // Test 2: Register staff
    const staffRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Staff',
      email: 'teststaff@test.com',
      password: 'Staff123',
      confirmPassword: 'Staff123'
    });
    logTest('Register Staff', staffRes.data.success, `Created user: ${staffRes.data.data?.user?.email}`);
    
    // Test 3: Duplicate email (should fail)
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Duplicate',
        email: 'testadmin@test.com',
        password: 'Test123',
        confirmPassword: 'Test123'
      });
      logTest('Duplicate Email Validation', false, 'Should have failed');
    } catch (err) {
      logTest('Duplicate Email Validation', err.response?.status === 400, 'Correctly rejected duplicate email');
    }
    
    // Test 4: Password mismatch
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test',
        email: 'test@test.com',
        password: 'Test123',
        confirmPassword: 'Test456'
      });
      logTest('Password Mismatch Validation', false, 'Should have failed');
    } catch (err) {
      logTest('Password Mismatch Validation', err.response?.status === 400, 'Correctly rejected mismatched passwords');
    }
    
  } catch (error) {
    logTest('Register Test', false, error.message);
  }
}

async function testAuthLogin() {
  log('\n=== Testing Auth - Login ===', 'cyan');
  
  try {
    // Test 1: Login admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testadmin@test.com',
      password: 'Admin123'
    });
    logTest('Login Admin', adminRes.data.success, `Token received`);
    adminToken = adminRes.data.data.token;
    
    // Test 2: Login staff
    const staffRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'teststaff@test.com',
      password: 'Staff123'
    });
    logTest('Login Staff', staffRes.data.success, `Token received`);
    staffToken = staffRes.data.data.token;
    
    // Test 3: Invalid credentials
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'testadmin@test.com',
        password: 'WrongPassword'
      });
      logTest('Invalid Credentials', false, 'Should have failed');
    } catch (err) {
      logTest('Invalid Credentials', err.response?.status === 401, 'Correctly rejected invalid credentials');
    }
    
  } catch (error) {
    logTest('Login Test', false, error.message);
  }
}

async function testAuthProfile() {
  log('\n=== Testing Auth - Get Profile ===', 'cyan');
  
  try {
    // Test 1: Get profile with token
    const res = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get Profile', res.data.success, `User: ${res.data.data.email}`);
    
    // Test 2: Get profile without token
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      logTest('Profile Without Token', false, 'Should have failed');
    } catch (err) {
      logTest('Profile Without Token', err.response?.status === 401, 'Correctly rejected unauthorized request');
    }
    
  } catch (error) {
    logTest('Get Profile Test', false, error.message);
  }
}

async function testInventoryCreate() {
  log('\n=== Testing Inventory - Create ===', 'cyan');
  
  try {
    // Test 1: Create inventory as admin
    const res = await axios.post(`${BASE_URL}/inventory`, {
      name: 'Test Item',
      description: 'Test Description',
      quantity: 100,
      unit: 'pcs',
      category: 'Electronics',
      location: 'Warehouse A',
      minStockLevel: 20,
      price: 29.99
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Create Inventory (Admin)', res.data.success, `Created item: ${res.data.data?.name}`);
    createdInventoryId = res.data.data?.id;
    
    // Test 2: Create inventory as staff
    const staffRes = await axios.post(`${BASE_URL}/inventory`, {
      name: 'Staff Item',
      description: 'Created by staff',
      quantity: 50,
      unit: 'kg',
      category: 'Raw Materials',
      location: 'Warehouse B',
      minStockLevel: 10,
      price: 15.50
    }, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    logTest('Create Inventory (Staff)', staffRes.data.success, `Created item: ${staffRes.data.data?.name}`);
    
    // Test 3: Create without required fields
    try {
      await axios.post(`${BASE_URL}/inventory`, {
        name: 'Incomplete Item'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Create Without Required Fields', false, 'Should have failed');
    } catch (err) {
      logTest('Create Without Required Fields', err.response?.status === 400, 'Correctly rejected incomplete data');
    }
    
  } catch (error) {
    logTest('Create Inventory Test', false, error.message);
  }
}

async function testInventoryGet() {
  log('\n=== Testing Inventory - Get ===', 'cyan');
  
  try {
    // Test 1: Get all inventory
    const allRes = await axios.get(`${BASE_URL}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get All Inventory', allRes.data.success, `Found ${allRes.data.data?.items?.length} items`);
    
    // Test 2: Get inventory by ID
    if (createdInventoryId) {
      const byIdRes = await axios.get(`${BASE_URL}/inventory/${createdInventoryId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Get Inventory By ID', byIdRes.data.success, `Item: ${byIdRes.data.data?.name}`);
    }
    
    // Test 3: Get with pagination
    const pageRes = await axios.get(`${BASE_URL}/inventory?page=0&size=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get With Pagination', pageRes.data.success, `Page size: ${pageRes.data.data?.items?.length}`);
    
    // Test 4: Get low stock items
    const lowStockRes = await axios.get(`${BASE_URL}/inventory/low-stock`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get Low Stock Items', lowStockRes.data.success, `Found ${lowStockRes.data.data?.length} low stock items`);
    
    // Test 5: Get categories
    const catRes = await axios.get(`${BASE_URL}/inventory/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get Categories', catRes.data.success, `Categories: ${catRes.data.data?.join(', ')}`);
    
  } catch (error) {
    logTest('Get Inventory Test', false, error.message);
  }
}

async function testInventoryUpdate() {
  log('\n=== Testing Inventory - Update ===', 'cyan');
  
  try {
    if (!createdInventoryId) {
      logTest('Update Inventory', false, 'No inventory item to update');
      return;
    }
    
    const res = await axios.put(`${BASE_URL}/inventory/${createdInventoryId}`, {
      name: 'Updated Test Item',
      description: 'Updated Description',
      quantity: 150,
      unit: 'pcs',
      category: 'Electronics',
      location: 'Warehouse A',
      minStockLevel: 30,
      price: 34.99
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Update Inventory', res.data.success, `Updated item: ${res.data.data?.name}`);
    
  } catch (error) {
    logTest('Update Inventory Test', false, error.message);
  }
}

async function testWorkOrderCreate() {
  log('\n=== Testing Work Orders - Create ===', 'cyan');
  
  try {
    const res = await axios.post(`${BASE_URL}/production`, {
      title: 'Test Work Order',
      description: 'Test work order description',
      priority: 'high',
      dueDate: '2025-12-31',
      status: 'pending',
      inventoryItems: createdInventoryId ? [
        { inventoryId: createdInventoryId, quantity: 10 }
      ] : []
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Create Work Order', res.data.success, `Created: ${res.data.data?.title}`);
    createdWorkOrderId = res.data.data?.id;
    
  } catch (error) {
    logTest('Create Work Order Test', false, error.message);
  }
}

async function testWorkOrderGet() {
  log('\n=== Testing Work Orders - Get ===', 'cyan');
  
  try {
    // Test 1: Get all work orders
    const allRes = await axios.get(`${BASE_URL}/production`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get All Work Orders', allRes.data.success, `Found ${allRes.data.data?.items?.length} orders`);
    
    // Test 2: Get by ID
    if (createdWorkOrderId) {
      const byIdRes = await axios.get(`${BASE_URL}/production/${createdWorkOrderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Get Work Order By ID', byIdRes.data.success, `Order: ${byIdRes.data.data?.title}`);
    }
    
    // Test 3: Get calendar data
    const calRes = await axios.get(`${BASE_URL}/production/calendar?startDate=2025-01-01&endDate=2025-12-31`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get Calendar Data', calRes.data.success, `Found ${calRes.data.data?.length} calendar entries`);
    
  } catch (error) {
    logTest('Get Work Orders Test', false, error.message);
  }
}

async function testWorkOrderUpdate() {
  log('\n=== Testing Work Orders - Update ===', 'cyan');
  
  try {
    if (!createdWorkOrderId) {
      logTest('Update Work Order', false, 'No work order to update');
      return;
    }
    
    const res = await axios.put(`${BASE_URL}/production/${createdWorkOrderId}`, {
      title: 'Updated Work Order',
      description: 'Updated description',
      priority: 'urgent',
      dueDate: '2025-12-25',
      status: 'in_progress',
      inventoryItems: []
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Update Work Order', res.data.success, `Updated: ${res.data.data?.title}`);
    
  } catch (error) {
    logTest('Update Work Order Test', false, error.message);
  }
}

async function testAnalytics() {
  log('\n=== Testing Analytics ===', 'cyan');
  
  try {
    // Test 1: Get summary
    const summaryRes = await axios.get(`${BASE_URL}/analytics/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get Analytics Summary', summaryRes.data.success, `Total inventory items: ${summaryRes.data.data?.inventory?.totalItems}`);
    
    // Test 2: Get production trend
    const trendRes = await axios.get(`${BASE_URL}/analytics/production-trend?days=30`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get Production Trend', trendRes.data.success, `Found ${trendRes.data.data?.length} trend entries`);
    
    // Test 3: Get inventory value
    const valueRes = await axios.get(`${BASE_URL}/analytics/inventory-value`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get Inventory Value', valueRes.data.success, `Found ${valueRes.data.data?.length} categories`);
    
  } catch (error) {
    logTest('Analytics Test', false, error.message);
  }
}

async function testUsers() {
  log('\n=== Testing Users ===', 'cyan');
  
  try {
    // Test 1: Get all users (admin only)
    const allRes = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Get All Users (Admin)', allRes.data.success, `Found ${allRes.data.data?.items?.length} users`);
    
    // Test 2: Staff trying to access users (should fail)
    try {
      await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      logTest('Get Users (Staff)', false, 'Staff should not have access');
    } catch (err) {
      logTest('Get Users (Staff - RBAC)', err.response?.status === 403, 'Correctly denied staff access');
    }
    
  } catch (error) {
    logTest('Users Test', false, error.message);
  }
}

async function testDelete() {
  log('\n=== Testing Delete Operations ===', 'cyan');
  
  try {
    // Test 1: Delete work order
    if (createdWorkOrderId) {
      const woRes = await axios.delete(`${BASE_URL}/production/${createdWorkOrderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Delete Work Order', woRes.data.success, 'Work order deleted');
    }
    
    // Test 2: Delete inventory
    if (createdInventoryId) {
      const invRes = await axios.delete(`${BASE_URL}/inventory/${createdInventoryId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Delete Inventory', invRes.data.success, 'Inventory item deleted');
    }
    
    // Test 3: Staff trying to delete (should fail)
    try {
      await axios.delete(`${BASE_URL}/inventory/999`, {
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      logTest('Delete As Staff', false, 'Staff should not be able to delete');
    } catch (err) {
      logTest('Delete As Staff (RBAC)', err.response?.status === 403, 'Correctly denied staff delete access');
    }
    
  } catch (error) {
    logTest('Delete Test', false, error.message);
  }
}

// Run all tests
async function runAllTests() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║  ProdX Backend API Test Suite             ║', 'blue');
  log('╚════════════════════════════════════════════╝\n', 'blue');
  
  try {
    await testAuthRegister();
    await wait(500);
    
    await testAuthLogin();
    await wait(500);
    
    await testAuthProfile();
    await wait(500);
    
    await testInventoryCreate();
    await wait(500);
    
    await testInventoryGet();
    await wait(500);
    
    await testInventoryUpdate();
    await wait(500);
    
    await testWorkOrderCreate();
    await wait(500);
    
    await testWorkOrderGet();
    await wait(500);
    
    await testWorkOrderUpdate();
    await wait(500);
    
    await testAnalytics();
    await wait(500);
    
    await testUsers();
    await wait(500);
    
    await testDelete();
    
    // Print summary
    log('\n╔════════════════════════════════════════════╗', 'blue');
    log('║  Test Summary                              ║', 'blue');
    log('╚════════════════════════════════════════════╝', 'blue');
    log(`\nTotal Tests: ${results.passed + results.failed}`, 'cyan');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, 'red');
    log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%\n`, 'yellow');
    
    if (results.failed > 0) {
      log('Failed Tests:', 'red');
      results.tests.filter(t => !t.status).forEach(t => {
        log(`  ✗ ${t.testName}: ${t.details}`, 'red');
      });
    }
    
  } catch (error) {
    log(`\nCritical Error: ${error.message}`, 'red');
    log('Make sure the server is running on http://localhost:4000', 'yellow');
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/inventory`, {
      headers: { Authorization: 'Bearer test' },
      validateStatus: () => true
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  log('Checking if server is running...', 'yellow');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('❌ Server is not running!', 'red');
    log('Please start the server first: npm run dev', 'yellow');
    process.exit(1);
  }
  
  log('✓ Server is running\n', 'green');
  await runAllTests();
})();
