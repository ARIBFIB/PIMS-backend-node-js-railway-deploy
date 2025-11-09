const ProductionLog = require('../models/ProductionLog');
const Material = require('../models/Material');

const getProductionReport = async (req, res) => {
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
    console.error('Get production report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const materials = await Material.getAll();
    
    // Add status to each material
    const materialsWithStatus = materials.map(material => ({
      ...material,
      status: material.quantity <= material.lowStockThreshold ? 'LOW_STOCK' : 'NORMAL'
    }));
    
    res.json(materialsWithStatus);
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { type, format } = req.query;
    
    if (!type || !format) {
      return res.status(400).json({ message: 'Report type and format are required' });
    }
    
    let data;
    
    if (type === 'production') {
      const { from, to } = req.query;
      const filters = {};
      
      if (from && to) {
        filters.from = from;
        filters.to = to;
      }
      
      data = await ProductionLog.getAll(filters);
    } else if (type === 'inventory') {
      data = await Material.getAll();
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }
    
    if (format === 'excel') {
      // For now, return JSON data
      // In a real implementation, you would use a library like exceljs to create an Excel file
      res.json({ message: 'Excel export not implemented yet', data });
    } else if (format === 'pdf') {
      // For now, return JSON data
      // In a real implementation, you would use a library like puppeteer to create a PDF file
      res.json({ message: 'PDF export not implemented yet', data });
    } else {
      return res.status(400).json({ message: 'Invalid export format' });
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProductionReport,
  getInventoryReport,
  exportReport
};