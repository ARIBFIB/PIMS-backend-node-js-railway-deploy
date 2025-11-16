const pool = require('../config/dbPool'); 

class Recipe {
  static async getAll() {
    try {
      // Try to select all fields including recipeUnit
      let recipeRows;
      try {
        [recipeRows] = await pool.execute(`
          SELECT r.*, c.name as categoryName 
          FROM recipes r 
          LEFT JOIN categories c ON r.categoryId = c.id 
          ORDER BY r.name
        `);
      } catch (error) {
        // If recipeUnit column doesn't exist, select without it
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes('recipeUnit')) {
          [recipeRows] = await pool.execute(`
            SELECT r.*, c.name as categoryName 
            FROM recipes r 
            LEFT JOIN categories c ON r.categoryId = c.id 
            ORDER BY r.name
          `);
          // Add default recipeUnit to each recipe
          recipeRows = recipeRows.map(recipe => ({
            ...recipe,
            recipeUnit: recipe.recipeUnit || 'unit'
          }));
        } else {
          throw error;
        }
      }
      
      // Get all ingredients for all recipes
      const [ingredientRows] = await pool.execute(`
        SELECT ri.*, m.name as materialName, m.unit, u.name as uomName, u.symbol as uomSymbol
        FROM recipe_ingredients ri 
        JOIN materials m ON ri.materialId = m.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id
        ORDER BY ri.recipeId
      `);
      
      // Group ingredients by recipeId
      const ingredientsByRecipe = {};
      ingredientRows.forEach(ingredient => {
        if (!ingredientsByRecipe[ingredient.recipeId]) {
          ingredientsByRecipe[ingredient.recipeId] = [];
        }
        ingredientsByRecipe[ingredient.recipeId].push(ingredient);
      });
      
      // Add ingredients to each recipe
      return recipeRows.map(recipe => ({
        ...recipe,
        ingredients: ingredientsByRecipe[recipe.id] || []
      }));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      // Try to select all fields including recipeUnit
      let recipeRows;
      try {
        [recipeRows] = await pool.execute(`
          SELECT r.*, c.name as categoryName 
          FROM recipes r 
          LEFT JOIN categories c ON r.categoryId = c.id 
          WHERE r.id = ?
        `, [id]);
      } catch (error) {
        // If recipeUnit column doesn't exist, select without it
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes('recipeUnit')) {
          [recipeRows] = await pool.execute(`
            SELECT r.*, c.name as categoryName 
            FROM recipes r 
            LEFT JOIN categories c ON r.categoryId = c.id 
            WHERE r.id = ?
          `, [id]);
          // Add default recipeUnit to each recipe
          recipeRows = recipeRows.map(recipe => ({
            ...recipe,
            recipeUnit: recipe.recipeUnit || 'unit'
          }));
        } else {
          throw error;
        }
      }
      
      if (recipeRows.length === 0) return null;
      
      const [ingredientRows] = await pool.execute(`
        SELECT ri.*, m.name as materialName, m.unit, u.name as uomName, u.symbol as uomSymbol
        FROM recipe_ingredients ri 
        JOIN materials m ON ri.materialId = m.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id
        WHERE ri.recipeId = ?
      `, [id]);
      
      return {
        ...recipeRows[0],
        ingredients: ingredientRows
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(recipeData) {
    const { name, category, categoryId, recipeUnit, ingredients } = recipeData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Handle undefined values properly
      const categoryName = category !== undefined ? category : null;
      const categoryIdValue = categoryId !== undefined ? categoryId : null;
      const recipeUnitValue = recipeUnit || 'unit';
      
      // Try to insert with recipeUnit column
      let recipeResult;
      try {
        [recipeResult] = await connection.execute(
          'INSERT INTO recipes (name, category, categoryId, recipeUnit) VALUES (?, ?, ?, ?)',
          [name, categoryName, categoryIdValue, recipeUnitValue]
        );
      } catch (error) {
        // If recipeUnit column doesn't exist, insert without it
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes('recipeUnit')) {
          [recipeResult] = await connection.execute(
            'INSERT INTO recipes (name, category, categoryId) VALUES (?, ?, ?)',
            [name, categoryName, categoryIdValue]
          );
        } else {
          throw error;
        }
      }
      
      const recipeId = recipeResult.insertId;
      
      for (const ingredient of ingredients) {
        await connection.execute(
          'INSERT INTO recipe_ingredients (recipeId, materialId, quantity) VALUES (?, ?, ?)',
          [recipeId, ingredient.materialId, ingredient.quantity]
        );
      }
      
      await connection.commit();
      return { id: recipeId, name, category: categoryName, categoryId: categoryIdValue, recipeUnit: recipeUnitValue };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, recipeData) {
    const { name, category, categoryId, recipeUnit, ingredients } = recipeData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Handle undefined values properly
      const categoryName = category !== undefined ? category : null;
      const categoryIdValue = categoryId !== undefined ? categoryId : null;
      const recipeUnitValue = recipeUnit || 'unit';
      
      // Try to update with recipeUnit column
      try {
        await connection.execute(
          'UPDATE recipes SET name = ?, category = ?, categoryId = ?, recipeUnit = ? WHERE id = ?',
          [name, categoryName, categoryIdValue, recipeUnitValue, id]
        );
      } catch (error) {
        // If recipeUnit column doesn't exist, update without it
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes('recipeUnit')) {
          await connection.execute(
            'UPDATE recipes SET name = ?, category = ?, categoryId = ? WHERE id = ?',
            [name, categoryName, categoryIdValue, id]
          );
        } else {
          throw error;
        }
      }
      
      await connection.execute(
        'DELETE FROM recipe_ingredients WHERE recipeId = ?',
        [id]
      );
      
      for (const ingredient of ingredients) {
        await connection.execute(
          'INSERT INTO recipe_ingredients (recipeId, materialId, quantity) VALUES (?, ?, ?)',
          [id, ingredient.materialId, ingredient.quantity]
        );
      }
      
      await connection.commit();
      return { id, name, category: categoryName, categoryId: categoryIdValue, recipeUnit: recipeUnitValue };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      await connection.execute(
        'DELETE FROM recipe_ingredients WHERE recipeId = ?',
        [id]
      );
      
      await connection.execute(
        'DELETE FROM recipes WHERE id = ?',
        [id]
      );
      
      await connection.commit();
      return { id };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteAll() {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get count of recipes before deleting
      const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM recipes');
      const recipeCount = countResult[0].count;
      
      await connection.execute('DELETE FROM recipe_ingredients');
      await connection.execute('DELETE FROM recipes');
      
      await connection.commit();
      return recipeCount;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async calculateMaterials(id, quantity) {
    try {
      const recipe = await this.findById(id);
      if (!recipe) throw new Error('Recipe not found');
      
      const [ingredientRows] = await pool.execute(`
        SELECT ri.*, m.name, m.unit, m.unitPrice, m.quantity as availableQuantity, m.lowStockThreshold, u.name as uomName, u.symbol as uomSymbol
        FROM recipe_ingredients ri 
        JOIN materials m ON ri.materialId = m.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id
        WHERE ri.recipeId = ?
      `, [id]);
      
      let totalCost = 0;
      const materialsRequired = [];
      
      for (const ingredient of ingredientRows) {
        const requiredQuantity = ingredient.quantity * quantity;
        const materialCost = requiredQuantity * ingredient.unitPrice;
        totalCost += materialCost;
        
        materialsRequired.push({
          id: ingredient.materialId,
          name: ingredient.name,
          quantity: requiredQuantity,
          unit: ingredient.unit,
          unitPrice: ingredient.unitPrice,
          totalCost: materialCost,
          availableQuantity: ingredient.availableQuantity,
          lowStockThreshold: ingredient.lowStockThreshold,
          isBelowThreshold: (ingredient.availableQuantity - requiredQuantity) < ingredient.lowStockThreshold
        });
      }
      
      return {
        recipeName: recipe.name,
        quantityToProduce: quantity,
        materialsRequired,
        estimatedCost: totalCost
      };
    } catch (error) {
      throw error;
    }
  }

  static async calculateMaxProduction(id) {
    try {
      const recipe = await this.findById(id);
      if (!recipe) throw new Error('Recipe not found');
      
      const [ingredientRows] = await pool.execute(`
        SELECT ri.*, m.name, m.unit, m.unitPrice, m.quantity as availableQuantity, m.lowStockThreshold, u.name as uomName, u.symbol as uomSymbol
        FROM recipe_ingredients ri 
        JOIN materials m ON ri.materialId = m.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id
        WHERE ri.recipeId = ?
      `, [id]);
      
      // Calculate maximum quantity that can be produced based on available materials
      let maxQuantity = Infinity;
      let limitingFactors = [];
      
      // Handle case where there are no ingredients
      if (ingredientRows.length === 0) {
        return {
          recipeName: recipe.name,
          maxQuantity: 0,
          limitingFactors: [],
          belowThresholdMaterials: []
        };
      }
      
      // For each ingredient, calculate how many units of the recipe can be produced
      for (const ingredient of ingredientRows) {
        // Skip ingredients with zero quantity requirement (shouldn't happen but just in case)
        if (ingredient.quantity <= 0) {
          continue;
        }
        
        // Calculate maximum producible units based on this ingredient
        // Formula: availableQuantity / quantityPerUnit
        const maxFromThisIngredient = Math.floor(ingredient.availableQuantity / ingredient.quantity);
        
        // Update the overall maximum if this ingredient is more limiting
        if (maxFromThisIngredient < maxQuantity) {
          maxQuantity = maxFromThisIngredient;
          limitingFactors = [{
            materialName: ingredient.name,
            available: ingredient.availableQuantity,
            requiredPerUnit: ingredient.quantity,
            maxProducible: maxFromThisIngredient
          }];
        } else if (maxFromThisIngredient === maxQuantity) {
          // Add to limiting factors if it's equally limiting
          limitingFactors.push({
            materialName: ingredient.name,
            available: ingredient.availableQuantity,
            requiredPerUnit: ingredient.quantity,
            maxProducible: maxFromThisIngredient
          });
        }
      }
      
      // If no valid ingredients with positive quantities, set max to 0
      if (maxQuantity === Infinity) {
        maxQuantity = 0;
      }
      
      // Check which materials would go below threshold after producing max quantity
      const belowThresholdMaterials = [];
      for (const ingredient of ingredientRows) {
        // Calculate how much of this material will be used
        const requiredQuantity = ingredient.quantity * maxQuantity;
        // Calculate how much will remain after production
        const remainingQuantity = ingredient.availableQuantity - requiredQuantity;
        
        // Check if remaining quantity would be below threshold
        if (remainingQuantity < ingredient.lowStockThreshold) {
          belowThresholdMaterials.push({
            name: ingredient.name,
            unit: ingredient.unit,
            remaining: remainingQuantity,
            threshold: ingredient.lowStockThreshold,
            required: requiredQuantity
          });
        }
      }
      
      return {
        recipeName: recipe.name,
        maxQuantity: maxQuantity,
        limitingFactors,
        belowThresholdMaterials
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Recipe;