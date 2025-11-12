const express = require('express');
const { body } = require('express-validator');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', authenticate, purchaseOrderController.getPurchaseOrderById);
router.post('/', authenticate, [
  body('supplierId').notEmpty().withMessage('Supplier ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], purchaseOrderController.createPurchaseOrder);
router.put('/:id', authenticate, [
  body('supplierId').notEmpty().withMessage('Supplier ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], purchaseOrderController.updatePurchaseOrder);
router.patch('/:id/approve', authenticate, purchaseOrderController.approvePurchaseOrder);
router.delete('/:id', authenticate, purchaseOrderController.deletePurchaseOrder);

module.exports = router;