const { pool } = require('../config/database');

class Supplier {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM suppliers ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM suppliers WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(supplierData) {
    const { name, contact, address } = supplierData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)',
        [name, contact, address]
      );
      return { id: result.insertId, name, contact, address };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, supplierData) {
    const { name, contact, address } = supplierData;
    
    try {
      await pool.execute(
        'UPDATE suppliers SET name = ?, contact = ?, address = ? WHERE id = ?',
        [name, contact, address, id]
      );
      return { id, name, contact, address };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM suppliers WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Supplier;