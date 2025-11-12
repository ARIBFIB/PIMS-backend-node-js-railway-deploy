const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/production', authenticate, reportController.getProductionReport);
router.get('/inventory', authenticate, reportController.getInventoryReport);
router.get('/lowstock', authenticate, reportController.getLowStockReport);
router.get('/export', authenticate, reportController.exportReport);

module.exports = router;