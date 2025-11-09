const express = require('express');
const { body } = require('express-validator');
const materialController = require('../controllers/materialController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, materialController.getAllMaterials);
router.get('/low-stock', authenticate, materialController.getLowStockItems);
router.get('/:id', authenticate, materialController.getMaterialById);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Material name is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unitPrice').isNumeric().withMessage('Unit price must be a number'),
  body('lowStockThreshold').isNumeric().withMessage('Low stock threshold must be a number')
], materialController.createMaterial);
router.put('/:id', authenticate, [
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unitPrice').isNumeric().withMessage('Unit price must be a number'),
  body('lowStockThreshold').isNumeric().withMessage('Low stock threshold must be a number')
], materialController.updateMaterial);
router.delete('/:id', authenticate, materialController.deleteMaterial);

module.exports = router;