const pool = require('../config/database');

class Material {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM materials ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM materials WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(materialData) {
    const { name, unit, quantity, unitPrice, lowStockThreshold } = materialData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO materials (name, unit, quantity, unitPrice, lowStockThreshold) VALUES (?, ?, ?, ?, ?)',
        [name, unit, quantity, unitPrice, lowStockThreshold]
      );
      return { id: result.insertId, ...materialData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, materialData) {
    const { name, unit, quantity, unitPrice, lowStockThreshold } = materialData;
    
    try {
      await pool.execute(
        'UPDATE materials SET name = ?, unit = ?, quantity = ?, unitPrice = ?, lowStockThreshold = ? WHERE id = ?',
        [name, unit, quantity, unitPrice, lowStockThreshold, id]
      );
      return { id, ...materialData };
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
      const [rows] = await pool.execute(
        'SELECT * FROM materials WHERE quantity <= lowStockThreshold'
      );
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
}

module.exports = Material;