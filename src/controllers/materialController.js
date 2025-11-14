const Material = require('../models/Material');

const getAllMaterials = async (req, res) => {
  try {
    console.log('Fetching all materials...');
    const materials = await Material.getAll();
    console.log('Retrieved materials count:', materials.length);
    res.json(materials);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching material by ID:', id);
    const material = await Material.findById(id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    console.log('Retrieved material:', material);
    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createMaterial = async (req, res) => {
  try {
    console.log('Received data for create:', req.body);
    const { name, unit, quantity, unitPrice, lowStockThreshold, categoryId, uomId } = req.body;
    
    // Validate input
    if (!name || !unit || quantity === undefined || unitPrice === undefined || lowStockThreshold === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    console.log('Creating material with data:', {
      name, unit, quantity, unitPrice, lowStockThreshold, categoryId, uomId
    });
    
    const material = await Material.create({
      name,
      unit,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      lowStockThreshold: parseFloat(lowStockThreshold),
      categoryId,
      uomId
    });
    
    console.log('Created material:', material);
    res.status(201).json({ message: 'Material added successfully', material });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateMaterial = async (req, res) => {
  try {
    console.log('Received data for update:', req.body);
    const { id } = req.params;
    const { name, unit, quantity, unitPrice, lowStockThreshold, categoryId, uomId } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (unit !== undefined) updateData.unit = unit;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = parseFloat(lowStockThreshold);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (uomId !== undefined) updateData.uomId = uomId;
    
    // Validate that at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'At least one field is required for update' });
    }
    
    console.log('Updating material ID:', id, 'with data:', updateData);
    
    const material = await Material.update(id, updateData);
    
    console.log('Updated material:', material);
    res.json({ message: 'Material updated successfully', material });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    console.log('Fetching low stock items...');
    const materials = await Material.getLowStockItems();
    console.log('Retrieved low stock items count:', materials.length);
    res.json(materials);
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting material ID:', id);
    
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
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteAllMaterials = async (req, res) => {
  try {
    console.log('Deleting all materials...');
    // Delete all materials
    const deleted = await Material.deleteAll();
    
    if (deleted) {
      res.json({ message: `All materials deleted successfully. ${deleted} materials removed.` });
    } else {
      res.status(500).json({ message: 'Failed to delete all materials' });
    }
  } catch (error) {
    console.error('Delete all materials error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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