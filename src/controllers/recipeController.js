const Recipe = require('../models/Recipe');

const getAllRecipes = async (req, res) => {
  try {
    const recipe = await Recipe.getAll();
    res.json(recipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createRecipe = async (req, res) => {
  try {
    const { name, category, recipeUnit, ingredients } = req.body;
    
    // Validate input
    if (!name || !category || !ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const recipe = await Recipe.create({
      name,
      category,
      recipeUnit,
      ingredients
    });
    
    res.status(201).json({ message: 'Recipe created successfully', recipe });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, recipeUnit, ingredients } = req.body;
    
    // Validate input
    if (!name || !category || !ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const recipe = await Recipe.update(id, {
      name,
      category,
      recipeUnit,
      ingredients
    });
    
    res.json({ message: 'Recipe updated successfully', recipe });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Recipe.delete(id);
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAllRecipes = async (req, res) => {
  try {
    const deletedCount = await Recipe.deleteAll();
    
    res.json({ message: `All recipes deleted successfully. ${deletedCount} recipes removed.` });
  } catch (error) {
    console.error('Delete all recipes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const calculateRecipeMaterials = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.query;
    
    if (!qty || isNaN(qty) || parseFloat(qty) <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    const calculation = await Recipe.calculateMaterials(id, parseFloat(qty));
    
    res.json(calculation);
  } catch (error) {
    console.error('Calculate recipe materials error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const calculateMaxProduction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const maxProduction = await Recipe.calculateMaxProduction(id);
    
    res.json(maxProduction);
  } catch (error) {
    console.error('Calculate max production error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  deleteAllRecipes,
  calculateRecipeMaterials,
  calculateMaxProduction
};