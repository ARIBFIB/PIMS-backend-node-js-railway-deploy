const express = require('express');
const { body } = require('express-validator');
const subCategoryController = require('../controllers/subCategoryController');
const { authenticate } = require('../middleware/auth');

console.log('🔧 SubCategory routes loaded');

const router = express.Router();

console.log('🔧 Setting up subCategory routes');

router.get('/', authenticate, subCategoryController.getAllSubCategories);
router.get('/:id', authenticate, subCategoryController.getSubCategoryById);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Sub-category name is required')
], subCategoryController.createSubCategory);
router.put('/:id', authenticate, [
  body('name').notEmpty().withMessage('Sub-category name is required')
], subCategoryController.updateSubCategory);
router.delete('/:id', authenticate, subCategoryController.deleteSubCategory);

module.exports = router;