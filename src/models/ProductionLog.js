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
    // Extract the date field but don't use it since the database auto-generates createdAt
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
      
      // Create production log (removed totalCost since it's a generated column)
      const [result] = await connection.execute(
        'INSERT INTO production_logs (recipeId, customerId, batchNumber, quantityProduced, materialCost, additionalExpense) VALUES (?, ?, ?, ?, ?, ?)',
        [recipeId, customerId || null, finalBatchNumber, quantityProduced, calculation.estimatedCost, additionalExpense]
      );
      
      await connection.commit();
      return {
        id: result.insertId,
        recipeId,
        customerId,
        batchNumber: finalBatchNumber,
        quantityProduced,
        materialCost: calculation.estimatedCost,
        additionalExpense
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
      
      // Update production log with batch number (status is not a column in the table)
      await connection.execute(
        'UPDATE production_logs SET batchNumber = ? WHERE id = ?',
        [batchNumber, id]
      );
      
      await connection.commit();
      return { id, batchNumber };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, updateData) {
    const { recipeId, customerId, quantityProduced, additionalExpense } = updateData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get the existing production log
      const [existingRows] = await connection.execute(
        'SELECT * FROM production_logs WHERE id = ?',
        [id]
      );
      
      if (existingRows.length === 0) {
        throw new Error('Production log not found');
      }
      
      const existingLog = existingRows[0];
      
      // If quantity is being updated, we need to adjust inventory
      if (quantityProduced !== undefined && quantityProduced !== existingLog.quantityProduced) {
        // Refund materials for the old quantity
        const oldCalculation = await Recipe.calculateMaterials(existingLog.recipeId, existingLog.quantityProduced);
        for (const material of oldCalculation.materialsRequired) {
          const materialData = await Material.findById(material.id);
          const newQuantity = materialData.quantity + material.quantity;
          await Material.updateQuantity(material.id, newQuantity);
        }
        
        // Deduct materials for the new quantity
        const newCalculation = await Recipe.calculateMaterials(recipeId || existingLog.recipeId, quantityProduced);
        for (const material of newCalculation.materialsRequired) {
          const materialData = await Material.findById(material.id);
          if (materialData.quantity < material.quantity) {
            throw new Error(`Insufficient ${material.name}. Available: ${materialData.quantity}, Required: ${material.quantity}`);
          }
          const newQuantity = materialData.quantity - material.quantity;
          await Material.updateQuantity(material.id, newQuantity);
        }
        
        // Update material cost
        await connection.execute(
          'UPDATE production_logs SET materialCost = ? WHERE id = ?',
          [newCalculation.estimatedCost, id]
        );
      }
      
      // Build update query dynamically based on provided fields
      const fields = [];
      const values = [];
      
      if (recipeId !== undefined) {
        fields.push('recipeId = ?');
        values.push(recipeId);
      }
      
      if (customerId !== undefined) {
        fields.push('customerId = ?');
        values.push(customerId || null);
      }
      
      if (quantityProduced !== undefined) {
        fields.push('quantityProduced = ?');
        values.push(quantityProduced);
      }
      
      if (additionalExpense !== undefined) {
        fields.push('additionalExpense = ?');
        values.push(additionalExpense);
      }
      
      if (fields.length > 0) {
        values.push(id); // Add id for WHERE clause
        await connection.execute(
          `UPDATE production_logs SET ${fields.join(', ')} WHERE id = ?`,
          values
        );
      }
      
      await connection.commit();
      return { id, ...updateData };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProductionLog;