const pool = require('../config/dbPool');
const Material = require('./Material');

class PurchaseOrder {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT po.*, s.id as supplierId, s.name as supplierName 
        FROM purchase_orders po 
        JOIN suppliers s ON po.supplierId = s.id 
        ORDER BY po.createdAt DESC
      `);
      
      // Get items for each order
      for (const order of rows) {
        const [items] = await pool.execute(`
          SELECT poi.*, m.name as materialName 
          FROM purchase_order_items poi 
          JOIN materials m ON poi.materialId = m.id 
          WHERE poi.purchaseOrderId = ?
        `, [order.id]);
        order.items = items;
        
        // Format supplier as object to match frontend expectations
        order.supplier = {
          id: order.supplierId,
          name: order.supplierName
        };
        
        // Remove duplicate fields
        delete order.supplierId;
        delete order.supplierName;
      }
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [orderRows] = await pool.execute(`
        SELECT po.*, s.id as supplierId, s.name as supplierName 
        FROM purchase_orders po 
        JOIN suppliers s ON po.supplierId = s.id 
        WHERE po.id = ?
      `, [id]);
      
      if (orderRows.length === 0) return null;
      
      const order = orderRows[0];
      
      const [items] = await pool.execute(`
        SELECT poi.*, m.name as materialName 
        FROM purchase_order_items poi 
        JOIN materials m ON poi.materialId = m.id 
        WHERE poi.purchaseOrderId = ?
      `, [id]);
      
      order.items = items;
      
      // Format supplier as object to match frontend expectations
      order.supplier = {
        id: order.supplierId,
        name: order.supplierName
      };
      
      // Remove duplicate fields
      delete order.supplierId;
      delete order.supplierName;
      
      return order;
    } catch (error) {
      throw error;
    }
  }

  static async create(orderData) {
    const { supplierId, items } = orderData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Calculate subtotal
      let subtotal = 0;
      for (const item of items) {
        const unitPrice = item.unitPrice || 0;
        subtotal += item.quantity * unitPrice;
      }
      
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      
      // Generate order number
      const [maxOrderRows] = await connection.execute('SELECT MAX(orderNumber) as maxOrderNumber FROM purchase_orders');
      const maxOrderNumber = maxOrderRows[0].maxOrderNumber || 'PO-00000';
      const nextOrderNumber = 'PO-' + String(parseInt(maxOrderNumber.split('-')[1]) + 1).padStart(5, '0');
      
      // Create purchase order
      const [orderResult] = await connection.execute(
        'INSERT INTO purchase_orders (orderNumber, supplierId, subtotal, tax, total, status) VALUES (?, ?, ?, ?, ?, ?)',
        [nextOrderNumber, supplierId, subtotal, tax, total, 'PENDING']
      );
      
      const orderId = orderResult.insertId;
      
      // Create purchase order items
      for (const item of items) {
        const unitPrice = item.unitPrice || 0;
        const totalPrice = item.quantity * unitPrice;
        await connection.execute(
          'INSERT INTO purchase_order_items (purchaseOrderId, materialId, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.materialId, item.quantity, unitPrice, totalPrice]
        );
      }
      
      await connection.commit();
      return {
        id: orderId,
        orderNumber: nextOrderNumber,
        supplierId,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        items
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async approve(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get the purchase order with items
      const order = await this.findById(id);
      if (!order) {
        throw new Error('Purchase order not found');
      }
      
      if (order.status !== 'PENDING') {
        throw new Error('Only pending orders can be approved');
      }
      
      // Update material quantities
      for (const item of order.items) {
        const material = await Material.findById(item.materialId);
        if (!material) {
          throw new Error(`Material with ID ${item.materialId} not found`);
        }
        const newQuantity = material.quantity + item.quantity;
        await Material.updateQuantity(item.materialId, newQuantity);
      }
      
      // Update order status
      await connection.execute(
        'UPDATE purchase_orders SET status = ? WHERE id = ?',
        ['APPROVED', id]
      );
      
      await connection.commit();
      return { id, status: 'APPROVED' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, orderData) {
    const { supplierId, items } = orderData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Check if order is still pending
      const [orderRows] = await connection.execute(
        'SELECT status FROM purchase_orders WHERE id = ?',
        [id]
      );
      
      if (orderRows.length === 0) {
        throw new Error('Purchase order not found');
      }
      
      if (orderRows[0].status !== 'PENDING') {
        throw new Error('Only pending orders can be updated');
      }
      
      // Calculate new subtotal
      let subtotal = 0;
      for (const item of items) {
        const unitPrice = item.unitPrice || 0;
        subtotal += item.quantity * unitPrice;
      }
      
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      
      // Update purchase order
      await connection.execute(
        'UPDATE purchase_orders SET supplierId = ?, subtotal = ?, tax = ?, total = ? WHERE id = ?',
        [supplierId, subtotal, tax, total, id]
      );
      
      // Delete existing items
      await connection.execute(
        'DELETE FROM purchase_order_items WHERE purchaseOrderId = ?',
        [id]
      );
      
      // Create new items
      for (const item of items) {
        const unitPrice = item.unitPrice || 0;
        const totalPrice = item.quantity * unitPrice;
        await connection.execute(
          'INSERT INTO purchase_order_items (purchaseOrderId, materialId, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)',
          [id, item.materialId, item.quantity, unitPrice, totalPrice]
        );
      }
      
      await connection.commit();
      return { id, supplierId, subtotal, tax, total, items };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Check if order is still pending
      const [orderRows] = await connection.execute(
        'SELECT status FROM purchase_orders WHERE id = ?',
        [id]
      );
      
      if (orderRows.length === 0) {
        throw new Error('Purchase order not found');
      }
      
      if (orderRows[0].status !== 'PENDING') {
        throw new Error('Only pending orders can be deleted');
      }
      
      // Delete order items
      await connection.execute(
        'DELETE FROM purchase_order_items WHERE purchaseOrderId = ?',
        [id]
      );
      
      // Delete order
      const [result] = await connection.execute(
        'DELETE FROM purchase_orders WHERE id = ?',
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

module.exports = PurchaseOrder;