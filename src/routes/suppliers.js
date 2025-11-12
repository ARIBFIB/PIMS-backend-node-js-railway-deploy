const express = require('express');
const { body } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, supplierController.getAllSuppliers);
router.get('/:id', authenticate, supplierController.getSupplierById);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Supplier name is required')
], supplierController.createSupplier);
router.put('/:id', authenticate, [
  body('name').notEmpty().withMessage('Supplier name is required')
], supplierController.updateSupplier);
router.delete('/:id', authenticate, supplierController.deleteSupplier);

module.exports = router;