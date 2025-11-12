const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, categoryController.getAllCategories);
router.get('/:id', authenticate, categoryController.getCategoryById);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Category name is required')
], categoryController.createCategory);
router.put('/:id', authenticate, [
  body('name').notEmpty().withMessage('Category name is required')
], categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;