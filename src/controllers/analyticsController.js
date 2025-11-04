const Analytics = require('../models/Analytics');

class AnalyticsController {
  static async getSummary(req, res) {
    try {
      const result = await Analytics.getSummary();
      res.json(result);
    } catch (error) {
      console.error('Get analytics summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while retrieving analytics summary'
      });
    }
  }
  
  static async getProductionTrend(req, res) {
    try {
      const { days = 30 } = req.query;
      
      const result = await Analytics.getProductionTrend(parseInt(days));
      res.json(result);
    } catch (error) {
      console.error('Get production trend error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while retrieving production trend'
      });
    }
  }
  
  static async getInventoryValue(req, res) {
    try {
      const result = await Analytics.getInventoryValue();
      res.json(result);
    } catch (error) {
      console.error('Get inventory value error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while retrieving inventory value'
      });
    }
  }
}

module.exports = AnalyticsController;