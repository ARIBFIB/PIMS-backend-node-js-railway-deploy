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
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // First delete related purchase order items
      await connection.execute(
        'DELETE poi FROM purchase_order_items poi JOIN purchase_orders po ON poi.purchaseOrderId = po.id WHERE po.supplierId = ?',
        [id]
      );
      
      // Then delete related purchase orders
      await connection.execute(
        'DELETE FROM purchase_orders WHERE supplierId = ?',
        [id]
      );
      
      // Finally delete the supplier
      const [result] = await connection.execute(
        'DELETE FROM suppliers WHERE id = ?',
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

module.exports = Supplier;
