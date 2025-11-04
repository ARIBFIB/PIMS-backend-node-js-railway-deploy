const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Get analytics summary
router.get('/summary', auth, AnalyticsController.getSummary);

// Get production trend
router.get('/production-trend', auth, AnalyticsController.getProductionTrend);

// Get inventory value by category
router.get('/inventory-value', auth, AnalyticsController.getInventoryValue);

module.exports = router;