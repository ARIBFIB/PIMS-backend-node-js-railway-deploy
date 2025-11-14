const { pool } = require('../config/database');

class Customer {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM customers ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM customers WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(customerData) {
    const { name, email, phone, address } = customerData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
        [name, email, phone, address]
      );
      return { id: result.insertId, ...customerData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, customerData) {
    const { name, email, phone, address } = customerData;
    
    try {
      await pool.execute(
        'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [name, email, phone, address, id]
      );
      return { id, ...customerData };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM customers WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Customer;