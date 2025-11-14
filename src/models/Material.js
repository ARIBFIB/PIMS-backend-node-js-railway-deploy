const { pool } = require('../config/dbPool');

class Material {
  static async getAll() {
    try {
      console.log('Executing Material.getAll query...');
      const query = `
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        ORDER BY m.name
      `;
      console.log('Query:', query);
      const [rows] = await pool.execute(query);
      console.log('Material.getAll query returned', rows.length, 'rows');
      return rows;
    } catch (error) {
      console.error('Error in Material.getAll:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async findById(id) {
    try {
      console.log('Executing Material.findById query for ID:', id);
      const query = `
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        WHERE m.id = ?
      `;
      console.log('Query:', query);
      const [rows] = await pool.execute(query, [id]);
      console.log('Material.findById query returned', rows.length, 'rows');
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Material.findById:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async create(materialData) {
    const { name, unit, categoryId, uomId, quantity, unitPrice, lowStockThreshold } = materialData;
    
    try {
      console.log('Executing Material.create with data:', materialData);
      const [result] = await pool.execute(
        'INSERT INTO materials (name, unit, categoryId, uomId, quantity, unitPrice, lowStockThreshold) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, unit, categoryId || null, uomId || null, quantity, unitPrice, lowStockThreshold]
      );
      console.log('Material.create inserted with ID:', result.insertId);
      return { id: result.insertId, ...materialData };
    } catch (error) {
      console.error('Error in Material.create:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async update(id, materialData) {
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
      console.log('Executing Material.update for ID:', id, 'with fields:', fields, 'and values:', values);
      await pool.execute(
        `UPDATE materials SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      console.log('Material.update completed for ID:', id);
      return { id, ...materialData };
    } catch (error) {
      console.error('Error in Material.update:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async updateQuantity(id, quantity) {
    try {
      console.log('Executing Material.updateQuantity for ID:', id, 'with quantity:', quantity);
      await pool.execute(
        'UPDATE materials SET quantity = ? WHERE id = ?',
        [quantity, id]
      );
      console.log('Material.updateQuantity completed for ID:', id);
      return { id, quantity };
    } catch (error) {
      console.error('Error in Material.updateQuantity:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async getLowStockItems() {
    try {
      console.log('Executing Material.getLowStockItems query...');
      const query = `
        SELECT m.*, c.name as categoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        WHERE m.quantity <= m.lowStockThreshold
      `;
      console.log('Query:', query);
      const [rows] = await pool.execute(query);
      console.log('Material.getLowStockItems query returned', rows.length, 'rows');
      return rows;
    } catch (error) {
      console.error('Error in Material.getLowStockItems:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async delete(id) {
    try {
      console.log('Executing Material.delete for ID:', id);
      const [result] = await pool.execute(
        'DELETE FROM materials WHERE id = ?',
        [id]
      );
      console.log('Material.delete affected', result.affectedRows, 'rows');
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Material.delete:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async deleteAll() {
    try {
      console.log('Executing Material.deleteAll query...');
      const [result] = await pool.execute('DELETE FROM materials');
      console.log('Material.deleteAll affected', result.affectedRows, 'rows');
      return result.affectedRows;
    } catch (error) {
      console.error('Error in Material.deleteAll:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }
}

module.exports = Material;