const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Get recipe categories
router.get('/categories', auth, RecipeController.getCategories);

// Get all recipes
router.get('/', auth, RecipeController.getAllRecipes);

// Get recipe by ID
router.get('/:id', auth, RecipeController.getRecipeById);

// Create recipe (admin and staff)
router.post('/', auth, rbac(['admin', 'staff']), RecipeController.createRecipe);

// Update recipe (admin and staff)
router.put('/:id', auth, rbac(['admin', 'staff']), RecipeController.updateRecipe);

// Delete recipe (admin only)
router.delete('/:id', auth, rbac(['admin']), RecipeController.deleteRecipe);

module.exports = router;