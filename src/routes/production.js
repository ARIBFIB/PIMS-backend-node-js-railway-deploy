const express = require('express');
const router = express.Router();
const ProductionController = require('../controllers/productionController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Get all work orders
router.get('/', auth, ProductionController.getAll);

// Get calendar data
router.get('/calendar', auth, ProductionController.getCalendarData);

// Get work order by ID
router.get('/:id', auth, ProductionController.getById);

// Create work order (admin and staff)
router.post('/', auth, rbac(['admin', 'staff']), ProductionController.create);

// Update work order (admin and staff)
router.put('/:id', auth, rbac(['admin', 'staff']), ProductionController.update);

// Delete work order (admin only)
router.delete('/:id', auth, rbac(['admin']), ProductionController.delete);

module.exports = router;