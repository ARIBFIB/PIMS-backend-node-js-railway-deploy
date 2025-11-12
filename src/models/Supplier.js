const pool = require('../config/dbPool');

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
    const { name, contact, email, phone, address } = supplierData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO suppliers (name, contact, email, phone, address) VALUES (?, ?, ?, ?, ?)',
        [name, contact, email, phone, address]
      );
      return { id: result.insertId, ...supplierData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, supplierData) {
    const { name, contact, email, phone, address } = supplierData;
    
    try {
      await pool.execute(
        'UPDATE suppliers SET name = ?, contact = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [name, contact, email, phone, address, id]
      );
      return { id, ...supplierData };
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