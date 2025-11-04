const { body } = require('express-validator');

const recipeValidation = [
  body('name').notEmpty().withMessage('Recipe name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('prepTime').isInt({ min: 1 }).withMessage('Prep time must be at least 1 minute'),
  body('cookTime').isInt({ min: 1 }).withMessage('Cook time must be at least 1 minute'),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be at least 1'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('ingredients.*.inventoryId').isInt({ min: 1 }).withMessage('Valid inventory ID is required'),
  body('ingredients.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be greater than 0'),
  body('instructions').isArray({ min: 1 }).withMessage('At least one instruction is required'),
];

const recipeUpdateValidation = [
  body('name').optional().notEmpty().withMessage('Recipe name cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('prepTime').optional().isInt({ min: 1 }).withMessage('Prep time must be at least 1 minute'),
  body('cookTime').optional().isInt({ min: 1 }).withMessage('Cook time must be at least 1 minute'),
  body('servings').optional().isInt({ min: 1 }).withMessage('Servings must be at least 1'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
];

module.exports = {
  recipeValidation,
  recipeUpdateValidation
};