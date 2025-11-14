const express = require('express');
const { body } = require('express-validator');
const recipeController = require('../controllers/recipeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, recipeController.getAllRecipes);
router.get('/:id', authenticate, recipeController.getRecipeById);
router.get('/:id/calc', authenticate, recipeController.calculateRecipeMaterials);
router.get('/:id/max-production', authenticate, recipeController.calculateMaxProduction);
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Recipe name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required')
], recipeController.createRecipe);
router.put('/:id', authenticate, [
  body('name').notEmpty().withMessage('Recipe name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required')
], recipeController.updateRecipe);
router.delete('/:id', authenticate, recipeController.deleteRecipe);
router.delete('/', authenticate, recipeController.deleteAllRecipes);

module.exports = router;