const pool = require('../config/database');
const { formatResponse, getPagination, getPagingData } = require('../utils/helpers');

class WorkOrder {
  static async create(orderData) {
    const { title, description, priority, assignedTo, dueDate, status = 'pending', inventoryItems } = orderData;
    
    try {
      // Start transaction
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      
      try {
        // Insert work order
        const result = await conn.query(
          'INSERT INTO work_orders (title, description, priority, assigned_to, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
          [title, description, priority, assignedTo, dueDate, status]
        );
        
        const workOrderId = result.insertId;
        
        // Insert inventory items if provided
        if (inventoryItems && inventoryItems.length > 0) {
          for (const item of inventoryItems) {
            await conn.query(
              'INSERT INTO work_order_items (work_order_id, inventory_id, quantity) VALUES (?, ?, ?)',
              [workOrderId, item.inventoryId, item.quantity]
            );
          }
        }
        
        await conn.commit();
        
        // Get created work order with items
        const newOrder = await this.findById(workOrderId);
        return formatResponse(true, 'Work order created successfully', newOrder);
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      // Get work order
      const orderRows = await pool.query('SELECT * FROM work_orders WHERE id = ?', [id]);
      
      if (orderRows.length === 0) {
        return null;
      }
      
      const workOrder = orderRows[0];
      
      // Get work order items
      const itemRows = await pool.query(
        `SELECT woi.id, woi.quantity, i.name as inventory_name, i.unit 
         FROM work_order_items woi 
         JOIN inventory i ON woi.inventory_id = i.id 
         WHERE woi.work_order_id = ?`,
        [id]
      );
      
      workOrder.items = itemRows;
      
      return workOrder;
    } catch (error) {
      throw error;
    }
  }
  
  static async getAll(page = 0, size = 10, status = '', assignedTo = '') {
    try {
      const { limit, offset } = getPagination(page, size);
      
      let query = `
        SELECT wo.*, u.name as assigned_to_name 
        FROM work_orders wo 
        LEFT JOIN users u ON wo.assigned_to = u.id 
        WHERE 1=1
      `;
      const params = [];
      
      if (status) {
        query += ' AND wo.status = ?';
        params.push(status);
      }
      
      if (assignedTo) {
        query += ' AND wo.assigned_to = ?';
        params.push(assignedTo);
      }
      
      query += ' ORDER BY wo.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await pool.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM work_orders WHERE 1=1';
      const countParams = [];
      
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      
      if (assignedTo) {
        countQuery += ' AND assigned_to = ?';
        countParams.push(assignedTo);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalItems = countResult[0].total;
      
      return getPagingData({ count: totalItems, rows }, page, limit);
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, orderData) {
    const { title, description, priority, assignedTo, dueDate, status, inventoryItems } = orderData;
    
    try {
      // Start transaction
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      
      try {
        // Update work order
        await conn.query(
          'UPDATE work_orders SET title = ?, description = ?, priority = ?, assigned_to = ?, due_date = ?, status = ? WHERE id = ?',
          [title, description, priority, assignedTo, dueDate, status, id]
        );
        
        // Update inventory items if provided
        if (inventoryItems !== undefined) {
          // Delete existing items
          await conn.query('DELETE FROM work_order_items WHERE work_order_id = ?', [id]);
          
          // Insert new items
          if (inventoryItems.length > 0) {
            for (const item of inventoryItems) {
              await conn.query(
                'INSERT INTO work_order_items (work_order_id, inventory_id, quantity) VALUES (?, ?, ?)',
                [id, item.inventoryId, item.quantity]
              );
            }
          }
        }
        
        await conn.commit();
        
        // Get updated work order
        const updatedOrder = await this.findById(id);
        return formatResponse(true, 'Work order updated successfully', updatedOrder);
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      // Start transaction
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      
      try {
        // Delete work order items
        await conn.query('DELETE FROM work_order_items WHERE work_order_id = ?', [id]);
        
        // Delete work order
        const result = await conn.query('DELETE FROM work_orders WHERE id = ?', [id]);
        
        await conn.commit();
        
        if (result.affectedRows === 0) {
          return formatResponse(false, 'Work order not found');
        }
        
        return formatResponse(true, 'Work order deleted successfully');
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async getCalendarData(startDate, endDate) {
    try {
      const rows = await pool.query(
        `SELECT id, title, due_date, status, priority 
         FROM work_orders 
         WHERE due_date BETWEEN ? AND ? 
         ORDER BY due_date`,
        [startDate, endDate]
      );
      
      return formatResponse(true, 'Calendar data retrieved successfully', rows);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WorkOrder;