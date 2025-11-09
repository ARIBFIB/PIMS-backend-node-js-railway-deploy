const ProductionLog = require('../models/ProductionLog');

const getProductionLogs = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filters = {};
    
    if (from && to) {
      filters.from = from;
      filters.to = to;
    }
    
    const logs = await ProductionLog.getAll(filters);
    res.json(logs);
  } catch (error) {
    console.error('Get production logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logProduction = async (req, res) => {
  try {
    const { recipeId, quantityProduced, additionalExpense } = req.body;
    
    // Validate input
    if (!recipeId || !quantityProduced || isNaN(quantityProduced) || parseFloat(quantityProduced) <= 0) {
      return res.status(400).json({ message: 'Valid recipe ID and quantity are required' });
    }
    
    const log = await ProductionLog.create({
      recipeId,
      quantityProduced: parseFloat(quantityProduced),
      additionalExpense: additionalExpense ? parseFloat(additionalExpense) : 0
    });
    
    res.status(201).json({ message: 'Production logged and inventory updated', log });
  } catch (error) {
    console.error('Log production error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getProductionLogs,
  logProduction
};