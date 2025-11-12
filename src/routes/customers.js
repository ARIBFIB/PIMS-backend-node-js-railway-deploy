const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Customer name is required')
], customerController.createCustomer);
router.put('/:id', authenticate, [
  body('name').notEmpty().withMessage('Customer name is required')
], customerController.updateCustomer);
router.delete('/:id', authenticate, customerController.deleteCustomer);

module.exports = router;