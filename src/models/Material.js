// const pool = require('../config/database');
const pool = require('../config/dbPool'); // Instead of database

class Material {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        ORDER BY m.name
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        WHERE m.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(materialData) {
    console.log('Creating material with data:', materialData);
    const { name, unit, categoryId, uomId, quantity, unitPrice, lowStockThreshold } = materialData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO materials (name, unit, categoryId, uomId, quantity, unitPrice, lowStockThreshold) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, unit, categoryId || null, uomId || null, quantity, unitPrice, lowStockThreshold]
      );
      
      // Get the full material data with joined information
      const [rows] = await pool.execute(`
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        WHERE m.id = ?
      `, [result.insertId]);
      
      console.log('Created material result:', rows[0]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, materialData) {
    console.log('Updating material', id, 'with data:', materialData);
    const { name, unit, categoryId, uomId, quantity, unitPrice, lowStockThreshold } = materialData;
    
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    
    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (unit !== undefined) {
      fields.push('unit = ?');
      values.push(unit);
    }
    if (categoryId !== undefined) {
      fields.push('categoryId = ?');
      values.push(categoryId || null);
    }
    if (uomId !== undefined) {
      fields.push('uomId = ?');
      values.push(uomId || null);
    }
    if (quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(quantity);
    }
    if (unitPrice !== undefined) {
      fields.push('unitPrice = ?');
      values.push(unitPrice);
    }
    if (lowStockThreshold !== undefined) {
      fields.push('lowStockThreshold = ?');
      values.push(lowStockThreshold);
    }
    
    // If no fields to update, return early
    if (fields.length === 0) {
      return { id };
    }
    
    values.push(id); // Add id for WHERE clause
    
    try {
      await pool.execute(
        `UPDATE materials SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Get the full material data with joined information
      const [rows] = await pool.execute(`
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        WHERE m.id = ?
      `, [id]);
      
      console.log('Updated material result:', rows[0]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateQuantity(id, quantity) {
    try {
      await pool.execute(
        'UPDATE materials SET quantity = ? WHERE id = ?',
        [quantity, id]
      );
      return { id, quantity };
    } catch (error) {
      throw error;
    }
  }

  static async getLowStockItems() {
    try {
      const [rows] = await pool.execute(`
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        WHERE m.quantity <= m.lowStockThreshold
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM materials WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAll() {
    try {
      const [result] = await pool.execute('DELETE FROM materials');
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Material;