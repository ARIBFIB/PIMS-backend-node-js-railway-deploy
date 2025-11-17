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
    try {
      // Check if supplier exists
      const supplier = await this.findById(id);
      if (!supplier) {
        throw new Error('Supplier not found');
      }
      
      // Check if supplier has any associated purchase orders
      const [purchaseOrderRows] = await pool.execute(
        'SELECT COUNT(*) as count FROM purchase_orders WHERE supplierId = ?',
        [id]
      );
      
      if (purchaseOrderRows[0].count > 0) {
        throw new Error(`Cannot delete supplier because it is associated with ${purchaseOrderRows[0].count} purchase order(s). Please delete the associated purchase orders first.`);
      }
      
      // If no purchase orders, proceed with deletion
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
