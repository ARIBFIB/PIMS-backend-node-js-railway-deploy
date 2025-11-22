const express = require('express');
const { body } = require('express-validator');
const subCategoryController = require('../controllers/subCategoryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, subCategoryController.getAllSubCategories);
router.get('/:id', authenticate, subCategoryController.getSubCategoryById);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Sub-category name is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required')
], subCategoryController.createSubCategory);
router.put('/:id', authenticate, [
  body('name').notEmpty().withMessage('Sub-category name is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required')
], subCategoryController.updateSubCategory);
router.delete('/:id', authenticate, subCategoryController.deleteSubCategory);

module.exports = router;