const Material = require('../models/Material');

const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.getAll();
    console.log('Retrieved materials:', materials);
    
    // Add support for multiple sub-categories in the response
    const materialsWithSubCategories = materials.map(material => {
      // For now, we're just returning the existing data
      // In the future, we could enhance this to include multiple sub-category names
      return material;
    });
    
    res.json(materialsWithSubCategories);
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
    console.log('Received data for create:', req.body);
    const { name, categoryId, subCategoryIds, uomId, lowStockThreshold } = req.body;
    
    // Validate input
    if (!name || lowStockThreshold === undefined) {
      return res.status(400).json({ message: 'Name and Low Stock Threshold are required' });
    }
    
    // For now, we'll only store the first sub-category ID since the DB column is INT
    // In the future, we might need to create a many-to-many relationship table
    let subCategoryId = null;
    if (subCategoryIds) {
      // If it's a comma-separated string, take the first one
      if (typeof subCategoryIds === 'string') {
        const ids = subCategoryIds.split(',').map(id => id.trim()).filter(id => id);
        if (ids.length > 0) {
          subCategoryId = ids[0]; // Only take the first one for now
        }
      } else {
        subCategoryId = subCategoryIds;
      }
    }
    
    const material = await Material.create({
      name,
      unit: null,
      quantity: 0,
      unitPrice: 0,
      lowStockThreshold: parseFloat(lowStockThreshold),
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null,
      uomId: uomId || null
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
    const { name, categoryId, subCategoryIds, uomId, lowStockThreshold } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = parseFloat(lowStockThreshold);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (uomId !== undefined) updateData.uomId = uomId;
    
    // Handle sub-category IDs
    if (subCategoryIds !== undefined) {
      // For now, we'll only store the first sub-category ID since the DB column is INT
      // In the future, we might need to create a many-to-many relationship table
      let subCategoryId = null;
      if (subCategoryIds) {
        // If it's a comma-separated string, take the first one
        if (typeof subCategoryIds === 'string') {
          const ids = subCategoryIds.split(',').map(id => id.trim()).filter(id => id);
          if (ids.length > 0) {
            subCategoryId = ids[0]; // Only take the first one for now
          }
        } else {
          subCategoryId = subCategoryIds;
        }
      }
      updateData.subCategoryId = subCategoryId;
    }
    
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
    
    // Log the materials to see what sub-category data is being returned
    console.log('Low stock items retrieved:', materials.length);
    if (materials.length > 0) {
      console.log('First few low stock items with sub-category data:', materials.slice(0, 3));
    }
    
    // Add status to each material - all items in low stock report should be LOW STOCK
    const materialsWithStatus = materials.map(material => ({
      ...material,
      status: 'LOW STOCK'
    }));
    
    console.log('Retrieved low stock items:', materialsWithStatus);
    res.json(materialsWithStatus);
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