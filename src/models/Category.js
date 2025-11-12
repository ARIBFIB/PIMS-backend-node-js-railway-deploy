const pool = require('../config/database');

class Category {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM categories ORDER BY code');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(categoryData) {
    const { name } = categoryData;
    
    try {
      // Get the next sequential code
      const [maxCodeRows] = await pool.execute('SELECT MAX(code) as maxCode FROM categories');
      const maxCode = maxCodeRows[0].maxCode || '000';
      const nextCode = String(parseInt(maxCode) + 1).padStart(3, '0');
      
      const [result] = await pool.execute(
        'INSERT INTO categories (code, name) VALUES (?, ?)',
        [nextCode, name]
      );
      return { id: result.insertId, code: nextCode, name };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, categoryData) {
    const { name } = categoryData;
    
    try {
      await pool.execute(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, id]
      );
      return { id, ...categoryData };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM categories WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category;