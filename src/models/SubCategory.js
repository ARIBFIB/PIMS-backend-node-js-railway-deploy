const pool = require('../config/dbPool');

console.log('🔧 SubCategory model loaded');

class SubCategory {
  static async getAll() {
    try {
      console.log('🔧 SubCategory.getAll() called');
      const query = `
        SELECT sc.*, c.name as categoryName 
        FROM sub_categories sc 
        LEFT JOIN categories c ON sc.categoryId = c.id 
        ORDER BY sc.code
      `;
      console.log('🔧 Executing query:', query);
      const [rows] = await pool.execute(query);
      console.log('🔧 Query result:', rows.length, 'rows');
      return rows;
    } catch (error) {
      console.error('❌ Get sub categories error:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sql:', error.sql);
      throw error;
    }
  }

  static async getByCategoryId(categoryId) {
    try {
      console.log('🔧 SubCategory.getByCategoryId() called with categoryId:', categoryId);
      const query = `
        SELECT sc.*, c.name as categoryName 
        FROM sub_categories sc 
        LEFT JOIN categories c ON sc.categoryId = c.id 
        WHERE sc.categoryId = ?
        ORDER BY sc.code
      `;
      console.log('🔧 Executing query:', query, 'with categoryId:', categoryId);
      const [rows] = await pool.execute(query, [categoryId]);
      console.log('🔧 Query result:', rows.length, 'rows');
      return rows;
    } catch (error) {
      console.error('❌ Get sub categories by category ID error:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sql:', error.sql);
      throw error;
    }
  }

  static async findById(id) {
    try {
      console.log('🔧 SubCategory.findById() called with id:', id);
      const query = `
        SELECT sc.*, c.name as categoryName 
        FROM sub_categories sc 
        LEFT JOIN categories c ON sc.categoryId = c.id 
        WHERE sc.id = ?
      `;
      console.log('🔧 Executing query:', query, 'with id:', id);
      const [rows] = await pool.execute(query, [id]);
      console.log('🔧 Query result:', rows.length, 'rows');
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Get sub-category error:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sql:', error.sql);
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