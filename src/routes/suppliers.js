const express = require('express');
const { body } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ✅ Get all suppliers
router.get('/', authenticate, supplierController.getAllSuppliers);

// ✅ Get supplier  by ID
router.get('/:id', authenticate, supplierController.getSupplierById);

// ✅ Create new supplier
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Supplier name is required'),
    body('contact').optional(),
    body('address').optional(),
  ],
  supplierController.createSupplier
);

// ✅ Update supplier
router.put(
  '/:id',
  authenticate,
  [
    body('name').notEmpty().withMessage('Supplier name is required'),
    body('contact').optional(),
    body('address').optional(),
  ],
  supplierController.updateSupplier
);

// ✅ Delete supplier
router.delete('/:id', authenticate, supplierController.deleteSupplier);

module.exports = router;
