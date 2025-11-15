const pool = require('../config/dbPool');
const Recipe = require('./Recipe');
const Material = require('./Material');

class ProductionLog {
  static async getAll(filters = {}) {
    let query = `
      SELECT pl.*, r.name as recipeName, c.name as customerName 
      FROM production_logs pl 
      JOIN recipes r ON pl.recipeId = r.id 
      LEFT JOIN customers c ON pl.customerId = c.id
    `;
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
    const { date, batchNumber, recipeId, customerId, quantityProduced, additionalExpense = 0 } = logData;
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
      
      // Use provided batch number or generate one
      let finalBatchNumber = batchNumber;
      if (!finalBatchNumber) {
        const [maxBatchRows] = await connection.execute('SELECT MAX(batchNumber) as maxBatchNumber FROM production_logs');
        const maxBatchNumber = maxBatchRows[0].maxBatchNumber || 'BATCH-00000';
        finalBatchNumber = 'BATCH-' + String(parseInt(maxBatchNumber.split('-')[1]) + 1).padStart(5, '0');
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
        'INSERT INTO production_logs (date, recipeId, customerId, batchNumber, quantityProduced, materialCost, additionalExpense, totalCost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [date || new Date().toISOString().split('T')[0], recipeId, customerId || null, finalBatchNumber, quantityProduced, calculation.estimatedCost, additionalExpense, totalCost, 'COMPLETED']
      );
      
      await connection.commit();
      return {
        id: result.insertId,
        date,
        recipeId,
        customerId,
        batchNumber: finalBatchNumber,
        quantityProduced,
        materialCost: calculation.estimatedCost,
        additionalExpense,
        totalCost,
        status: 'COMPLETED'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async approve(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get the production log
      const [logRows] = await connection.execute(
        'SELECT * FROM production_logs WHERE id = ?',
        [id]
      );
      
      if (logRows.length === 0) {
        throw new Error('Production log not found');
      }
      
      const log = logRows[0];
      
      if (log.status !== 'PENDING') {
        throw new Error('Only pending production logs can be approved');
      }
      
      // Calculate materials needed
      const calculation = await Recipe.calculateMaterials(log.recipeId, log.quantityProduced);
      
      // Check if enough materials are available
      for (const material of calculation.materialsRequired) {
        const materialData = await Material.findById(material.id);
        if (materialData.quantity < material.quantity) {
          throw new Error(`Insufficient ${material.name}. Available: ${materialData.quantity}, Required: ${material.quantity}`);
        }
      }
      
      // Generate batch number if not already set
      let batchNumber = log.batchNumber;
      if (!batchNumber) {
        const [maxBatchRows] = await connection.execute('SELECT MAX(batchNumber) as maxBatchNumber FROM production_logs');
        const maxBatchNumber = maxBatchRows[0].maxBatchNumber || 'BATCH-00000';
        batchNumber = 'BATCH-' + String(parseInt(maxBatchNumber.split('-')[1]) + 1).padStart(5, '0');
      }
      
      // Deduct materials from inventory
      for (const material of calculation.materialsRequired) {
        const materialData = await Material.findById(material.id);
        const newQuantity = materialData.quantity - material.quantity;
        await Material.updateQuantity(material.id, newQuantity);
      }
      
      // Update production log status
      await connection.execute(
        'UPDATE production_logs SET status = ?, batchNumber = ? WHERE id = ?',
        ['COMPLETED', batchNumber, id]
      );
      
      await connection.commit();
      return { id, status: 'COMPLETED', batchNumber };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProductionLog;