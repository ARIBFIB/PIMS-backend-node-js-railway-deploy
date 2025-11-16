// const pool = require('../config/database');
const pool = require('../config/dbPool'); // Instead of database

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
    
    // Handle undefined values by converting them to null for database
    const emailValue = email || null;
    const phoneValue = phone || null;
    const addressValue = address || null;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
        [name, emailValue, phoneValue, addressValue]
      );
      return { id: result.insertId, name, email, phone, address };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, customerData) {
    const { name, email, phone, address } = customerData;
    
    // Handle undefined values by converting them to null for database
    const emailValue = email || null;
    const phoneValue = phone || null;
    const addressValue = address || null;
    
    try {
      await pool.execute(
        'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [name, emailValue, phoneValue, addressValue, id]
      );
      return { id, name, email, phone, address };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // First, set customerId to NULL in production_logs to maintain referential integrity
      await connection.execute(
        'UPDATE production_logs SET customerId = NULL WHERE customerId = ?',
        [id]
      );
      
      // Now delete the customer
      const [result] = await connection.execute(
        'DELETE FROM customers WHERE id = ?',
        [id]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Customer;