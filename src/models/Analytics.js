const pool = require('../config/database');
const { formatResponse, convertBigIntToNumber } = require('../utils/helpers');

class Analytics {
  static async getSummary() {
    try {
      // Get inventory summary
      const inventoryResult = await pool.query(
        'SELECT COUNT(*) as total_items, SUM(quantity) as total_quantity, SUM(quantity * price) as total_value FROM inventory'
      );
      
      // Get low stock items count
      const lowStockResult = await pool.query(
        'SELECT COUNT(*) as low_stock_count FROM inventory WHERE quantity <= min_stock_level'
      );
      
      // Get work orders summary
      const workOrdersResult = await pool.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_orders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders
         FROM work_orders`
      );
      
      // Get production data for the last 30 days
      const productionResult = await pool.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders_count
         FROM work_orders
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date`
      );
      
      // Get inventory by category
      const categoryResult = await pool.query(
        `SELECT 
          category,
          COUNT(*) as items_count,
          SUM(quantity) as total_quantity,
          SUM(quantity * price) as total_value
         FROM inventory
         GROUP BY category
         ORDER BY total_value DESC`
      );
      
      const summary = {
        inventory: {
          totalItems: Number(inventoryResult[0].total_items || 0),
          totalQuantity: Number(inventoryResult[0].total_quantity || 0),
          totalValue: parseFloat(inventoryResult[0].total_value || 0).toFixed(2),
          lowStockCount: Number(lowStockResult[0].low_stock_count || 0)
        },
        workOrders: {
          total: Number(workOrdersResult[0].total_orders || 0),
          completed: Number(workOrdersResult[0].completed_orders || 0),
          inProgress: Number(workOrdersResult[0].in_progress_orders || 0),
          pending: Number(workOrdersResult[0].pending_orders || 0)
        },
        production: convertBigIntToNumber(productionResult),
        categories: convertBigIntToNumber(categoryResult)
      };
      
      return formatResponse(true, 'Analytics summary retrieved successfully', summary);
    } catch (error) {
      throw error;
    }
  }
  
  static async getProductionTrend(days = 30) {
    try {
      const rows = await pool.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders_count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
         FROM work_orders
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [days]
      );
      
      return formatResponse(true, 'Production trend retrieved successfully', convertBigIntToNumber(rows));
    } catch (error) {
      throw error;
    }
  }
  
  static async getInventoryValue() {
    try {
      const rows = await pool.query(
        `SELECT 
          category,
          SUM(quantity * price) as value
         FROM inventory
         GROUP BY category
         ORDER BY value DESC`
      );
      
      return formatResponse(true, 'Inventory value by category retrieved successfully', convertBigIntToNumber(rows));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Analytics;