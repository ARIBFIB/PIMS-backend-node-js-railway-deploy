const UnitOfMeasure = require('../models/UnitOfMeasure');

const getAllUOMs = async (req, res) => {
  try {
    const uoms = await UnitOfMeasure.getAll();
    res.json(uoms);
  } catch (error) {
    console.error('Get UOMs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUOMById = async (req, res) => {
  try {
    const { id } = req.params;
    const uom = await UnitOfMeasure.findById(id);
    
    if (!uom) {
      return res.status(404).json({ message: 'Unit of Measure not found' });
    }
    
    res.json(uom);
  } catch (error) {
    console.error('Get UOM error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createUOM = async (req, res) => {
  try {
    const { name, symbol } = req.body;
    
    // Validate input
    if (!name || !symbol) {
      return res.status(400).json({ message: 'Name and symbol are required' });
    }
    
    const uom = await UnitOfMeasure.create({
      name,
      symbol
    });
    
    res.status(201).json({ message: 'Unit of Measure created successfully', uom });
  } catch (error) {
    console.error('Create UOM error:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUOM = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol } = req.body;
    
    // Validate input
    if (!name || !symbol) {
      return res.status(400).json({ message: 'Name and symbol are required' });
    }
    
    const uom = await UnitOfMeasure.update(id, {
      name,
      symbol
    });
    
    res.json({ message: 'Unit of Measure updated successfully', uom });
  } catch (error) {
    console.error('Update UOM error:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUOM = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if UOM exists
    const uom = await UnitOfMeasure.findById(id);
    if (!uom) {
      return res.status(404).json({ message: 'Unit of Measure not found' });
    }
    
    // Delete the UOM
    const deleted = await UnitOfMeasure.delete(id);
    if (deleted) {
      res.json({ message: 'Unit of Measure deleted successfully', name: uom.name });
    } else {
      res.status(500).json({ message: 'Failed to delete Unit of Measure' });
    }
  } catch (error) {
    console.error('Delete UOM error:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};

const deleteAllUOMs = async (req, res) => {
  try {
    // Delete all UOMs
    const deleted = await UnitOfMeasure.deleteAll();
    
    res.json({ message: `All Unit of Measures deleted successfully. ${deleted} UOMs removed.` });
  } catch (error) {
    console.error('Delete all UOMs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUOMs,
  getUOMById,
  createUOM,
  updateUOM,
  deleteUOM,
  deleteAllUOMs
};