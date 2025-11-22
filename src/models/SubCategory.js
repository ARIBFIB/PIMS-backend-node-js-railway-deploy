const pool = require('../config/dbPool');

class SubCategory {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT sc.*, c.name as categoryName 
        FROM sub_categories sc 
        LEFT JOIN categories c ON sc.categoryId = c.id 
        ORDER BY sc.code
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT sc.*, c.name as categoryName 
        FROM sub_categories sc 
        LEFT JOIN categories c ON sc.categoryId = c.id 
        WHERE sc.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(subCategoryData) {
    const { name, categoryId = null } = subCategoryData;
    
    try {
      // Get the next sequential code
      const [maxCodeRows] = await pool.execute('SELECT MAX(code) as maxCode FROM sub_categories');
      const maxCode = maxCodeRows[0].maxCode || '000';
      const nextCode = String(parseInt(maxCode) + 1).padStart(3, '0');
      
      const [result] = await pool.execute(
        'INSERT INTO sub_categories (code, name, categoryId) VALUES (?, ?, ?)',
        [nextCode, name, categoryId]
      );
      return { id: result.insertId, code: nextCode, name, categoryId };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, subCategoryData) {
    const { name, categoryId = null } = subCategoryData;
    
    try {
      await pool.execute(
        'UPDATE sub_categories SET name = ?, categoryId = ? WHERE id = ?',
        [name, categoryId, id]
      );
      return { id, ...subCategoryData };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM sub_categories WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SubCategory;