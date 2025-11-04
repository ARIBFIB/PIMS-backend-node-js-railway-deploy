const Inventory = require('../models/Inventory');
const { formatResponse } = require('../utils/helpers');

class InventoryController {
  static async getAll(req, res) {
    try {
      const { page = 0, size = 10, search = '', category = '' } = req.query;
      
      const result = await Inventory.getAll(
        parseInt(page),
        parseInt(size),
        search,
        category
      );
      
      res.json(
        formatResponse(true, 'Inventory items retrieved successfully', result)
      );
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving inventory items')
      );
    }
  }
  
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const item = await Inventory.findById(id);
      
      if (!item) {
        return res.status(404).json(
          formatResponse(false, 'Inventory item not found')
        );
      }
      
      res.json(
        formatResponse(true, 'Inventory item retrieved successfully', item)
      );
    } catch (error) {
      console.error('Get inventory item error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving inventory item')
      );
    }
  }
  
  static async create(req, res) {
    try {
      const { name, description, quantity, unit, category, location, minStockLevel, price } = req.body;
      
      // Validation
      if (!name || !quantity || !unit || !category || !price) {
        return res.status(400).json(
          formatResponse(false, 'Required fields are missing')
        );
      }
      
      const result = await Inventory.create({
        name,
        description,
        quantity,
        unit,
        category,
        location,
        minStockLevel,
        price
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Create inventory item error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while creating inventory item')
      );
    }
  }
  
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, quantity, unit, category, location, minStockLevel, price } = req.body;
      
      // Check if item exists
      const existingItem = await Inventory.findById(id);
      if (!existingItem) {
        return res.status(404).json(
          formatResponse(false, 'Inventory item not found')
        );
      }
      
      const result = await Inventory.update(id, {
        name,
        description,
        quantity,
        unit,
        category,
        location,
        minStockLevel,
        price
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Update inventory item error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while updating inventory item')
      );
    }
  }
  
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const result = await Inventory.delete(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Delete inventory item error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while deleting inventory item')
      );
    }
  }
  
  static async getLowStockItems(req, res) {
    try {
      const result = await Inventory.getLowStockItems();
      res.json(result);
    } catch (error) {
      console.error('Get low stock items error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving low stock items')
      );
    }
  }
  
  static async getCategories(req, res) {
    try {
      const result = await Inventory.getCategories();
      res.json(result);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving categories')
      );
    }
  }
}

module.exports = InventoryController;