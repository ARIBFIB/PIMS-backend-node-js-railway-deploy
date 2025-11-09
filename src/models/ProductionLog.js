const pool = require('../config/database');
const Recipe = require('./Recipe');
const Material = require('./Material');

class ProductionLog {
  static async getAll(filters = {}) {
    let query = 'SELECT pl.*, r.name as recipeName FROM production_logs pl JOIN recipes r ON pl.recipeId = r.id';
    const params = [];
    
    if (filters.from && filters.to) {
      query += ' WHERE pl.createdAt BETWEEN ? AND ?';
      params.push(filters.from, filters.to);
    }
    
    query += ' ORDER BY pl.createdAt DESC';
    
    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(logData) {
    const { recipeId, quantityProduced, additionalExpense = 0 } = logData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Calculate materials needed
      const calculation = await Recipe.calculateMaterials(recipeId, quantityProduced);
      
      // Check if enough materials are available
      for (const material of calculation.materialsRequired) {
        const materialData = await Material.findById(material.id);
        if (materialData.quantity < material.quantity) {
          throw new Error(`Insufficient ${material.name}. Available: ${materialData.quantity}, Required: ${material.quantity}`);
        }
      }
      
      // Deduct materials from inventory
      for (const material of calculation.materialsRequired) {
        const materialData = await Material.findById(material.id);
        const newQuantity = materialData.quantity - material.quantity;
        await Material.updateQuantity(material.id, newQuantity);
      }
      
      // Create production log
      const totalCost = calculation.estimatedCost + parseFloat(additionalExpense);
      const [result] = await connection.execute(
        'INSERT INTO production_logs (recipeId, quantityProduced, materialCost, additionalExpense, totalCost) VALUES (?, ?, ?, ?, ?)',
        [recipeId, quantityProduced, calculation.estimatedCost, additionalExpense, totalCost]
      );
      
      await connection.commit();
      return {
        id: result.insertId,
        recipeId,
        quantityProduced,
        materialCost: calculation.estimatedCost,
        additionalExpense,
        totalCost
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProductionLog;