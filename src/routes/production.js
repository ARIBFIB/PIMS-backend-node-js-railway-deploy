const express = require('express');
const { body } = require('express-validator');
const productionController = require('../controllers/productionController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, productionController.getProductionLogs);
router.get('/:id', authenticate, productionController.getProductionLog);
router.post('/', authenticate, [
  body('recipeId').notEmpty().withMessage('Recipe ID is required'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('quantityProduced').isNumeric({ gt: 0 }).withMessage('Quantity produced must be a positive number')
], productionController.logProduction);
router.put('/:id', authenticate, productionController.updateProductionLog);
router.patch('/:id/approve', authenticate, productionController.approveProduction);

module.exports = router;