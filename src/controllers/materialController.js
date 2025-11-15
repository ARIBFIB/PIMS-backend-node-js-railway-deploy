const Material = require('../models/Material');

const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.getAll();
    console.log('Retrieved materials:', materials);
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
    
    console.log('Retrieved material by ID:', material);
    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { name, unit, quantity, lowStockThreshold, categoryId, uomId } = req.body;
    
    // Validate input - quantity is optional for new materials, defaults to 0
    if (!name || lowStockThreshold === undefined) {
      return res.status(400).json({ message: 'Name and low stock threshold are required' });
    }
    
    const material = await Material.create({
      name,
      unit,
      quantity: quantity !== undefined ? parseFloat(quantity) : 0, // Default to 0 if not provided
      lowStockThreshold: parseFloat(lowStockThreshold),
      categoryId,
      uomId
    });
    
    console.log('Created material:', material);
    res.status(201).json({ message: 'Material added successfully', material });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateMaterial = async (req, res) => {
  try {
    console.log('Received data for update:', req.body);
    const { id } = req.params;
    const { name, unit, quantity, lowStockThreshold, categoryId, uomId } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (unit !== undefined) updateData.unit = unit;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = parseFloat(lowStockThreshold);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (uomId !== undefined) updateData.uomId = uomId;
    
    // Validate that at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'At least one field is required for update' });
    }
    
    const material = await Material.update(id, updateData);
    
    console.log('Updated material:', material);
    res.json({ message: 'Material updated successfully', material });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const materials = await Material.getLowStockItems();
    console.log('Retrieved low stock items:', materials);
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

const deleteAllMaterials = async (req, res) => {
  try {
    // Delete all materials
    const deleted = await Material.deleteAll();
    
    if (deleted) {
      res.json({ message: `All materials deleted successfully. ${deleted} materials removed.` });
    } else {
      res.status(500).json({ message: 'Failed to delete all materials' });
    }
  } catch (error) {
    console.error('Delete all materials error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteAllMaterials,
  getLowStockItems
};