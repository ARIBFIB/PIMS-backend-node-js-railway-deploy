const pool = require('../config/database');
const { formatResponse } = require('../utils/helpers');

class Recipe {
  static async create(recipeData) {
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
      notes,
      totalCost,
      totalIngredientCost,
      costPerServing,
      created_by
    } = recipeData;
    
    try {
      const result = await pool.query(
        `INSERT INTO recipes 
        (name, description, category, prep_time, cook_time, servings, difficulty, 
        instructions, ingredients, additional_costs, notes, total_cost, 
        total_ingredient_cost, cost_per_serving, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, description, category, prepTime, cookTime, servings, difficulty,
          JSON.stringify(instructions), JSON.stringify(ingredients), 
          JSON.stringify(additionalCosts || []), notes, totalCost, 
          totalIngredientCost, costPerServing, created_by
        ]
      );
      
      const newRecipe = await this.findById(result.insertId);
      
      return formatResponse(true, 'Recipe created successfully', newRecipe);
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const rows = await pool.query(
        `SELECT id, name, description, category, prep_time, cook_time, servings, 
        difficulty, instructions, ingredients, additional_costs, notes, 
        total_cost, total_ingredient_cost, cost_per_serving, created_by, 
        updated_by, created_at, updated_at 
        FROM recipes WHERE id = ?`, 
        [id]
      );
      
      if (rows.length === 0) return null;
      
      const recipe = rows[0];
      recipe.instructions = JSON.parse(recipe.instructions);
      recipe.ingredients = JSON.parse(recipe.ingredients);
      recipe.additional_costs = JSON.parse(recipe.additional_costs);
      
      return recipe;
    } catch (error) {
      throw error;
    }
  }
  
  static async findAll(filters = {}) {
    try {
      let query = `SELECT id, name, description, category, prep_time, cook_time, servings, 
                  difficulty, instructions, ingredients, additional_costs, notes, 
                  total_cost, total_ingredient_cost, cost_per_serving, created_by, 
                  updated_by, created_at, updated_at 
                  FROM recipes WHERE 1=1`;
      const params = [];
      
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }
      
      if (filters.search) {
        query += ' AND (name LIKE ? OR category LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const rows = await pool.query(query, params);
      
      return rows.map(recipe => ({
        ...recipe,
        instructions: JSON.parse(recipe.instructions),
        ingredients: JSON.parse(recipe.ingredients),
        additional_costs: JSON.parse(recipe.additional_costs)
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async findAndCountAll(options = {}) {
    try {
      const { page = 0, size = 10, category, search } = options;
      const offset = page * size;
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM recipes WHERE 1=1';
      const countParams = [];
      
      if (category) {
        countQuery += ' AND category = ?';
        countParams.push(category);
      }
      
      if (search) {
        countQuery += ' AND (name LIKE ? OR category LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalItems = countResult[0].total;
      
      // Get paginated data
      let query = `SELECT id, name, description, category, prep_time, cook_time, servings, 
                  difficulty, instructions, ingredients, additional_costs, notes, 
                  total_cost, total_ingredient_cost, cost_per_serving, created_by, 
                  updated_by, created_at, updated_at 
                  FROM recipes WHERE 1=1`;
      const params = [...countParams];
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      if (search) {
        query += ' AND (name LIKE ? OR category LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(size, offset);
      
      const rows = await pool.query(query, params);
      
      const recipes = rows.map(recipe => ({
        ...recipe,
        instructions: JSON.parse(recipe.instructions),
        ingredients: JSON.parse(recipe.ingredients),
        additional_costs: JSON.parse(recipe.additional_costs)
      }));
      
      return {
        count: totalItems,
        rows: recipes
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, recipeData) {
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
      notes,
      totalCost,
      totalIngredientCost,
      costPerServing,
      updated_by
    } = recipeData;
    
    try {
      await pool.query(
        `UPDATE recipes SET 
        name = ?, description = ?, category = ?, prep_time = ?, cook_time = ?, 
        servings = ?, difficulty = ?, instructions = ?, ingredients = ?, 
        additional_costs = ?, notes = ?, total_cost = ?, total_ingredient_cost = ?, 
        cost_per_serving = ?, updated_by = ?, updated_at = NOW() 
        WHERE id = ?`,
        [
          name, description, category, prepTime, cookTime, servings, difficulty,
          JSON.stringify(instructions), JSON.stringify(ingredients), 
          JSON.stringify(additionalCosts || []), notes, totalCost, 
          totalIngredientCost, costPerServing, updated_by, id
        ]
      );
      
      const updatedRecipe = await this.findById(id);
      return formatResponse(true, 'Recipe updated successfully', updatedRecipe);
    } catch (error) {
      throw error;
    }
  }
  
  static async destroy(id) {
    try {
      const result = await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return formatResponse(false, 'Recipe not found');
      }
      
      return formatResponse(true, 'Recipe deleted successfully');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Recipe };