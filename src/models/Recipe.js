const pool = require('../config/dbPool'); 

class Recipe {
  static async getAll() {
    try {
      let [recipeRows] = await pool.execute(`
        SELECT r.*, c.name as categoryName 
        FROM recipes r 
        LEFT JOIN categories c ON r.categoryId = c.id 
        ORDER BY r.name
      `);
      
      // Ensure all recipes have a recipeUnit property
      // If the column doesn't exist in the database, recipe.recipeUnit will be undefined
      recipeRows = recipeRows.map(recipe => ({
        ...recipe,
        recipeUnit: recipe.recipeUnit !== undefined ? recipe.recipeUnit : 'unit'
      }));
      
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
      let [recipeRows] = await pool.execute(`
        SELECT r.*, c.name as categoryName 
        FROM recipes r 
        LEFT JOIN categories c ON r.categoryId = c.id 
        WHERE r.id = ?
      `, [id]);
      
      if (recipeRows.length === 0) return null;
      
      // Ensure recipe has a recipeUnit property
      // If the column doesn't exist in the database, recipe.recipeUnit will be undefined
      const recipe = {
        ...recipeRows[0],
        recipeUnit: recipeRows[0].recipeUnit !== undefined ? recipeRows[0].recipeUnit : 'unit'
      };
      
      const [ingredientRows] = await pool.execute(`
        SELECT ri.*, m.name as materialName, m.unit, u.name as uomName, u.symbol as uomSymbol
        FROM recipe_ingredients ri 
        JOIN materials m ON ri.materialId = m.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id
        WHERE ri.recipeId = ?
      `, [id]);
      
      return {
        ...recipe,
        ingredients: ingredientRows
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(recipeData) {
    console.log('Recipe data received in model:', recipeData);
    const { name, category, categoryId, recipeUnit, ingredients } = recipeData;
    console.log('Recipe unit value:', recipeUnit);
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Handle undefined values properly
      const categoryName = category !== undefined ? category : null;
      const categoryIdValue = categoryId !== undefined ? categoryId : null;
      // Only default to 'unit' if recipeUnit is null or undefined, not for empty strings
      const recipeUnitValue = (recipeUnit !== undefined && recipeUnit !== null) ? recipeUnit : 'unit';
      
      // Try to insert with recipeUnit column first
      let recipeResult;
      try {
        [recipeResult] = await connection.execute(
          'INSERT INTO recipes (name, category, categoryId, recipeUnit) VALUES (?, ?, ?, ?)',
          [name, categoryName, categoryIdValue, recipeUnitValue]
        );
      } catch (insertError) {
        // If recipeUnit column doesn't exist, fall back to insert without it
        if (insertError.code === 'ER_BAD_FIELD_ERROR' && insertError.sqlMessage.includes('recipeUnit')) {
          [recipeResult] = await connection.execute(
            'INSERT INTO recipes (name, category, categoryId) VALUES (?, ?, ?)',
            [name, categoryName, categoryIdValue]
          );
          console.log('Warning: recipeUnit column not found, inserted without it');
        } else {
          // Re-throw if it's a different error
          throw insertError;
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
    console.log('Recipe update data received in model:', recipeData);
    const { name, category, categoryId, recipeUnit, ingredients } = recipeData;
    console.log('Recipe unit value for update:', recipeUnit);
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Handle undefined values properly
      const categoryName = category !== undefined ? category : null;
      const categoryIdValue = categoryId !== undefined ? categoryId : null;
      // Only default to 'unit' if recipeUnit is null or undefined, not for empty strings
      const recipeUnitValue = (recipeUnit !== undefined && recipeUnit !== null) ? recipeUnit : 'unit';
      
      // Try to update with recipeUnit column first
      try {
        await connection.execute(
          'UPDATE recipes SET name = ?, category = ?, categoryId = ?, recipeUnit = ? WHERE id = ?',
          [name, categoryName, categoryIdValue, recipeUnitValue, id]
        );
      } catch (updateError) {
        // If recipeUnit column doesn't exist, fall back to update without it
        if (updateError.code === 'ER_BAD_FIELD_ERROR' && updateError.sqlMessage.includes('recipeUnit')) {
          await connection.execute(
            'UPDATE recipes SET name = ?, category = ?, categoryId = ? WHERE id = ?',
            [name, categoryName, categoryIdValue, id]
          );
          console.log('Warning: recipeUnit column not found, updated without it');
        } else {
          // Re-throw if it's a different error
          throw updateError;
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
      
      // Delete related records first to avoid foreign key constraint violations
      await connection.execute(
        'DELETE FROM production_logs WHERE recipeId = ?',
        [id]
      );
      
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
      
      // Delete related records first to avoid foreign key constraint violations
      await connection.execute('DELETE FROM production_logs');
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
          uomName: ingredient.uomName,
          uomSymbol: ingredient.uomSymbol,
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
      
      // Handle case where there are no ingredients
      if (ingredientRows.length === 0) {
        return {
          recipeName: recipe.name,
          maxQuantityWithThreshold: 0,
          maxQuantityWithoutThreshold: 0,
          limitingFactors: [],
          belowThresholdMaterials: []
        };
      }
      
      // Calculate maximum quantity that can be produced based on available materials (WITHOUT considering threshold)
      let maxQuantityWithoutThreshold = Infinity;
      let limitingFactorsWithoutThreshold = [];
      
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
        if (maxFromThisIngredient < maxQuantityWithoutThreshold) {
          maxQuantityWithoutThreshold = maxFromThisIngredient;
          limitingFactorsWithoutThreshold = [{
            materialName: ingredient.name,
            available: ingredient.availableQuantity,
            requiredPerUnit: ingredient.quantity,
            maxProducible: maxFromThisIngredient
          }];
        } else if (maxFromThisIngredient === maxQuantityWithoutThreshold) {
          // Add to limiting factors if it's equally limiting
          limitingFactorsWithoutThreshold.push({
            materialName: ingredient.name,
            available: ingredient.availableQuantity,
            requiredPerUnit: ingredient.quantity,
            maxProducible: maxFromThisIngredient
          });
        }
      }
      
      // If no valid ingredients with positive quantities, set max to 0
      if (maxQuantityWithoutThreshold === Infinity) {
        maxQuantityWithoutThreshold = 0;
      }
      
      // Calculate maximum quantity that can be produced based on available materials (WITH considering threshold)
      let maxQuantityWithThreshold = Infinity;
      let limitingFactorsWithThreshold = [];
      
      // For each ingredient, calculate how many units of the recipe can be produced without going below threshold
      for (const ingredient of ingredientRows) {
        // Skip ingredients with zero quantity requirement (shouldn't happen but just in case)
        if (ingredient.quantity <= 0) {
          continue;
        }
        
        // Calculate maximum producible units based on this ingredient without going below threshold
        // Formula: (availableQuantity - lowStockThreshold) / quantityPerUnit
        const maxFromThisIngredient = Math.floor((ingredient.availableQuantity - ingredient.lowStockThreshold) / ingredient.quantity);
        
        // Update the overall maximum if this ingredient is more limiting
        if (maxFromThisIngredient < maxQuantityWithThreshold) {
          maxQuantityWithThreshold = maxFromThisIngredient;
          limitingFactorsWithThreshold = [{
            materialName: ingredient.name,
            available: ingredient.availableQuantity,
            threshold: ingredient.lowStockThreshold,
            requiredPerUnit: ingredient.quantity,
            maxProducible: maxFromThisIngredient
          }];
        } else if (maxFromThisIngredient === maxQuantityWithThreshold) {
          // Add to limiting factors if it's equally limiting
          limitingFactorsWithThreshold.push({
            materialName: ingredient.name,
            available: ingredient.availableQuantity,
            threshold: ingredient.lowStockThreshold,
            requiredPerUnit: ingredient.quantity,
            maxProducible: maxFromThisIngredient
          });
        }
      }
      
      // If no valid ingredients with positive quantities, set max to 0
      if (maxQuantityWithThreshold === Infinity) {
        maxQuantityWithThreshold = 0;
      }
      
      // Use the more restrictive of the two values as the actual max quantity
      const maxQuantity = Math.min(maxQuantityWithThreshold, maxQuantityWithoutThreshold);
      
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
            uomName: ingredient.uomName,
            uomSymbol: ingredient.uomSymbol,
            remaining: remainingQuantity,
            threshold: ingredient.lowStockThreshold,
            required: requiredQuantity
          });
        }
      }
      
      return {
        recipeName: recipe.name,
        maxQuantityWithThreshold: maxQuantityWithThreshold,
        maxQuantityWithoutThreshold: maxQuantityWithoutThreshold,
        maxQuantity: maxQuantity,
        limitingFactorsWithThreshold,
        limitingFactorsWithoutThreshold,
        limitingFactors: maxQuantityWithThreshold <= maxQuantityWithoutThreshold ? limitingFactorsWithThreshold : limitingFactorsWithoutThreshold,
        belowThresholdMaterials
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Recipe;