const pool = require('../config/database');

class Recipe {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM recipes ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [recipeRows] = await pool.execute(
        'SELECT * FROM recipes WHERE id = ?',
        [id]
      );
      
      if (recipeRows.length === 0) return null;
      
      const [ingredientRows] = await pool.execute(
        'SELECT ri.*, m.name as materialName, m.unit FROM recipe_ingredients ri JOIN materials m ON ri.materialId = m.id WHERE ri.recipeId = ?',
        [id]
      );
      
      return {
        ...recipeRows[0],
        ingredients: ingredientRows
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(recipeData) {
    const { name, category, ingredients } = recipeData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [recipeResult] = await connection.execute(
        'INSERT INTO recipes (name, category) VALUES (?, ?)',
        [name, category]
      );
      
      const recipeId = recipeResult.insertId;
      
      for (const ingredient of ingredients) {
        await connection.execute(
          'INSERT INTO recipe_ingredients (recipeId, materialId, quantity) VALUES (?, ?, ?)',
          [recipeId, ingredient.materialId, ingredient.quantity]
        );
      }
      
      await connection.commit();
      return { id: recipeId, name, category };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, recipeData) {
    const { name, category, ingredients } = recipeData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      await connection.execute(
        'UPDATE recipes SET name = ?, category = ? WHERE id = ?',
        [name, category, id]
      );
      
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
      return { id, name, category };
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

  static async calculateMaterials(id, quantity) {
    try {
      const recipe = await this.findById(id);
      if (!recipe) throw new Error('Recipe not found');
      
      const [ingredientRows] = await pool.execute(
        `SELECT ri.*, m.name, m.unit, m.unitPrice 
         FROM recipe_ingredients ri 
         JOIN materials m ON ri.materialId = m.id 
         WHERE ri.recipeId = ?`,
        [id]
      );
      
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
          totalCost: materialCost
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
}

module.exports = Recipe;