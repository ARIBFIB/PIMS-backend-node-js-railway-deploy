const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Get all inventory items
router.get('/', auth, InventoryController.getAll);

// Get inventory categories
router.get('/categories', auth, InventoryController.getCategories);

// Get low stock items
router.get('/low-stock', auth, InventoryController.getLowStockItems);

// Get inventory item by ID
router.get('/:id', auth, InventoryController.getById);

// Create inventory item (admin and staff)
router.post('/', auth, rbac(['admin', 'staff']), InventoryController.create);

// Update inventory item (admin and staff)
router.put('/:id', auth, rbac(['admin', 'staff']), InventoryController.update);

// Delete inventory item (admin only)
router.delete('/:id', auth, rbac(['admin']), InventoryController.delete);

module.exports = router;