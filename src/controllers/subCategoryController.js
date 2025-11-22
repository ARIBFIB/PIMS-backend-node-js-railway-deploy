const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.getAll();
    res.json(subCategories);
  } catch (error) {
    console.error('Get sub categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);
    
    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }
    
    res.json(subCategory);
  } catch (error) {
    console.error('Get sub-category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    
    // Validate input
    if (!name || !categoryId) {
      return res.status(400).json({ message: 'Sub-category name and category ID are required' });
    }
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const subCategory = await SubCategory.create({
      name,
      categoryId
    });
    
    res.status(201).json({ message: 'Sub-category created successfully', subCategory });
  } catch (error) {
    console.error('Create sub-category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;
    
    // Validate input
    if (!name || !categoryId) {
      return res.status(400).json({ message: 'Sub-category name and category ID are required' });
    }
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const subCategory = await SubCategory.update(id, {
      name,
      categoryId
    });
    
    res.json({ message: 'Sub-category updated successfully', subCategory });
  } catch (error) {
    console.error('Update sub-category error:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
};