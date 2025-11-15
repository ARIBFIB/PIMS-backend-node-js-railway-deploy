const express = require('express');
const { body } = require('express-validator');
const uomController = require('../controllers/uomController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, uomController.getAllUOMs);
router.get('/:id', authenticate, uomController.getUOMById);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('UOM name is required'),
  body('symbol').notEmpty().withMessage('UOM symbol is required')
], uomController.createUOM);
router.put('/:id', authenticate, [
  body('name').notEmpty().withMessage('UOM name is required'),
  body('symbol').notEmpty().withMessage('UOM symbol is required')
], uomController.updateUOM);
router.delete('/:id', authenticate, uomController.deleteUOM);
router.delete('/', authenticate, uomController.deleteAllUOMs);

module.exports = router;