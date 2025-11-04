const pool = require('../config/database');
const { formatResponse, getPagination, getPagingData } = require('../utils/helpers');

class Inventory {
  static async create(itemData) {
    const { name, description, quantity, unit, category, location, minStockLevel, price } = itemData;
    
    try {
      const result = await pool.query(
        'INSERT INTO inventory (name, description, quantity, unit, category, location, min_stock_level, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, description, quantity, unit, category, location, minStockLevel, price]
      );
      
      const newItem = await this.findById(result.insertId);
      return formatResponse(true, 'Inventory item created successfully', newItem);
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const rows = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  static async getAll(page = 0, size = 10, search = '', category = '') {
    try {
      const { limit, offset } = getPagination(page, size);
      
      let query = 'SELECT * FROM inventory WHERE 1=1';
      const params = [];
      
      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY name LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await pool.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM inventory WHERE 1=1';
      const countParams = [];
      
      if (search) {
        countQuery += ' AND (name LIKE ? OR description LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }
      
      if (category) {
        countQuery += ' AND category = ?';
        countParams.push(category);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalItems = countResult[0].total;
      
      return getPagingData({ count: totalItems, rows }, page, limit);
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, itemData) {
    const { name, description, quantity, unit, category, location, minStockLevel, price } = itemData;
    
    try {
      await pool.query(
        'UPDATE inventory SET name = ?, description = ?, quantity = ?, unit = ?, category = ?, location = ?, min_stock_level = ?, price = ? WHERE id = ?',
        [name, description, quantity, unit, category, location, minStockLevel, price, id]
      );
      
      const updatedItem = await this.findById(id);
      return formatResponse(true, 'Inventory item updated successfully', updatedItem);
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return formatResponse(false, 'Inventory item not found');
      }
      
      return formatResponse(true, 'Inventory item deleted successfully');
    } catch (error) {
      throw error;
    }
  }
  
  static async getLowStockItems() {
    try {
      const rows = await pool.query(
        'SELECT * FROM inventory WHERE quantity <= min_stock_level ORDER BY quantity ASC'
      );
      return formatResponse(true, 'Low stock items retrieved successfully', rows);
    } catch (error) {
      throw error;
    }
  }
  
  static async getCategories() {
    try {
      const rows = await pool.query('SELECT DISTINCT category FROM inventory ORDER BY category');
      const categories = rows.map(row => row.category);
      return formatResponse(true, 'Categories retrieved successfully', categories);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Inventory;