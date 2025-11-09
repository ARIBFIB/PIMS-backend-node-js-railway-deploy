const Material = require('../models/Material');

const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.getAll();
    res.json(materials);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { name, unit, quantity, unitPrice, lowStockThreshold } = req.body;
    
    // Validate input
    if (!name || !unit || quantity === undefined || unitPrice === undefined || lowStockThreshold === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const material = await Material.create({
      name,
      unit,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      lowStockThreshold: parseFloat(lowStockThreshold)
    });
    
    res.status(201).json({ message: 'Material added successfully', material });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, quantity, unitPrice, lowStockThreshold } = req.body;
    
    // Validate input
    if (!name || !unit || quantity === undefined || unitPrice === undefined || lowStockThreshold === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const material = await Material.update(id, {
      name,
      unit,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      lowStockThreshold: parseFloat(lowStockThreshold)
    });
    
    res.json({ message: 'Material updated successfully', material });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const materials = await Material.getLowStockItems();
    res.json(materials);
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if material exists
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    // Delete the material
    const deleted = await Material.delete(id);
    if (deleted) {
      res.json({ message: 'Material deleted successfully', name: material.name });
    } else {
      res.status(500).json({ message: 'Failed to delete material' });
    }
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getLowStockItems
};