const SubCategory = require('../models/SubCategory');

console.log('🔧 SubCategory controller loaded');

const getAllSubCategories = async (req, res) => {
  console.log('🔧 getAllSubCategories called with query:', req.query);
  try {
    const { categoryId } = req.query;
    
    let subCategories;
    if (categoryId) {
      // Validate that categoryId is a valid number
      const categoryIdNum = parseInt(categoryId, 10);
      if (isNaN(categoryIdNum)) {
        return res.status(400).json({ 
          message: 'Invalid category ID provided', 
          error: 'Category ID must be a number' 
        });
      }
      subCategories = await SubCategory.getByCategoryId(categoryIdNum);
    } else {
      subCategories = await SubCategory.getAll();
    }
    
    console.log('🔧 getAllSubCategories result:', subCategories.length, 'items');
    console.log('🔧 First few items:', subCategories.slice(0, 3));
    // Ensure we're returning an array
    const result = Array.isArray(subCategories) ? subCategories : [];
    res.json(result);
  } catch (error) {
    console.error('Get sub categories error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sql: error.sql
    });
  }
};

const getSubCategoryById = async (req, res) => {
  console.log('🔧 getSubCategoryById called with params:', req.params);
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);
    
    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }
    
    res.json(subCategory);
  } catch (error) {
    console.error('Get sub-category error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sql: error.sql
    });
  }
};

const createSubCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Sub-category name is required' });
    }
    
    const subCategory = await SubCategory.create({
      name
    });
    
    res.status(201).json({ message: 'Sub-category created successfully', subCategory });
  } catch (error) {
    console.error('Create sub-category error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Sub-category name is required' });
    }
    
    const subCategory = await SubCategory.update(id, {
      name
    });
    
    res.json({ message: 'Sub-category updated successfully', subCategory });
  } catch (error) {
    console.error('Update sub-category error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if sub-category exists
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }
    
    // Delete the sub-category
    const deleted = await SubCategory.delete(id);
    if (deleted) {
      res.json({ message: 'Sub-category deleted successfully', name: subCategory.name });
    } else {
      res.status(500).json({ message: 'Failed to delete sub-category' });
    }
  } catch (error) {
    console.error('Delete sub-category error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getAllSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
};