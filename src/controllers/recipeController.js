const { Recipe } = require('../models/Recipe');
const { User } = require('../models/User');
const { Inventory } = require('../models/Inventory');
const { validationResult } = require('express-validator');
const { recipeValidation, recipeUpdateValidation } = require('../validators/recipeValidation');

const createRecipe = async (req, res) => {
  try {
    await Promise.all(recipeValidation.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      instructions,
      ingredients,
      additionalCosts,
      notes
    } = req.body;

    const userId = req.user.id;

    // Calculate costs
    let totalIngredientCost = 0;
    let totalAdditionalCost = 0;

    // Calculate ingredient costs
    for (const ingredient of ingredients) {
      // Note: We'll need to adjust this when we have the proper Inventory model
      // For now, we'll skip the cost calculation
    }

    // Calculate additional costs
    for (const cost of additionalCosts || []) {
      if (cost.type === 'fixed') {
        totalAdditionalCost += cost.amount;
      } else if (cost.type === 'percentage') {
        totalAdditionalCost += (totalIngredientCost * cost.amount) / 100;
      }
    }

    const totalCost = totalIngredientCost + totalAdditionalCost;
    const costPerServing = totalCost / servings;

    const recipeData = {
      name,
      description,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      instructions,
      ingredients,
      additionalCosts,
      notes,
      totalCost,
      totalIngredientCost,
      costPerServing,
      created_by: userId
    };

    const result = await Recipe.create(recipeData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Recipe created successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create recipe'
    });
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const category = req.query.category;
    const search = req.query.search;

    const options = {
      page,
      size,
      category,
      search
    };

    const data = await Recipe.findAndCountAll(options);

    res.json({
      success: true,
      data: {
        items: data.rows,
        totalItems: Number(data.count),
        totalPages: Math.ceil(Number(data.count) / size),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes'
    });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe'
    });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await Promise.all(recipeUpdateValidation.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      instructions,
      ingredients,
      additionalCosts,
      notes
    } = req.body;

    // Recalculate costs
    let totalIngredientCost = 0;
    let totalAdditionalCost = 0;

    for (const ingredient of ingredients) {
      // Note: We'll need to adjust this when we have the proper Inventory model
      // For now, we'll skip the cost calculation
    }

    for (const cost of additionalCosts || []) {
      if (cost.type === 'fixed') {
        totalAdditionalCost += cost.amount;
      } else if (cost.type === 'percentage') {
        totalAdditionalCost += (totalIngredientCost * cost.amount) / 100;
      }
    }

    const totalCost = totalIngredientCost + totalAdditionalCost;
    const costPerServing = totalCost / servings;

    const recipeData = {
      name,
      description,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      instructions,
      ingredients,
      additionalCosts,
      notes,
      totalCost,
      totalIngredientCost,
      costPerServing,
      updated_by: userId
    };

    const result = await Recipe.update(id, recipeData);

    if (result.success) {
      res.json({
        success: true,
        message: 'Recipe updated successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recipe'
    });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const result = await Recipe.destroy(id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Recipe deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recipe'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    // This is a simplified implementation
    // In a real application, you would query the database for distinct categories
    const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Snacks'];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getCategories
};