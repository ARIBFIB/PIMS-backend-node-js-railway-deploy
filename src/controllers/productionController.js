const WorkOrder = require('../models/WorkOrder');
const { formatResponse } = require('../utils/helpers');

class ProductionController {
  static async getAll(req, res) {
    try {
      const { page = 0, size = 10, status = '', assignedTo = '' } = req.query;
      
      const result = await WorkOrder.getAll(
        parseInt(page),
        parseInt(size),
        status,
        assignedTo
      );
      
      res.json(
        formatResponse(true, 'Work orders retrieved successfully', result)
      );
    } catch (error) {
      console.error('Get work orders error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving work orders')
      );
    }
  }
  
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const workOrder = await WorkOrder.findById(id);
      
      if (!workOrder) {
        return res.status(404).json(
          formatResponse(false, 'Work order not found')
        );
      }
      
      res.json(
        formatResponse(true, 'Work order retrieved successfully', workOrder)
      );
    } catch (error) {
      console.error('Get work order error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving work order')
      );
    }
  }
  
  static async create(req, res) {
    try {
      const { title, description, priority, assignedTo, dueDate, status, inventoryItems } = req.body;
      
      // Validation
      if (!title || !priority || !dueDate) {
        return res.status(400).json(
          formatResponse(false, 'Required fields are missing')
        );
      }
      
      const result = await WorkOrder.create({
        title,
        description,
        priority,
        assignedTo,
        dueDate,
        status,
        inventoryItems
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Create work order error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while creating work order')
      );
    }
  }
  
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, priority, assignedTo, dueDate, status, inventoryItems } = req.body;
      
      // Check if work order exists
      const existingOrder = await WorkOrder.findById(id);
      if (!existingOrder) {
        return res.status(404).json(
          formatResponse(false, 'Work order not found')
        );
      }
      
      const result = await WorkOrder.update(id, {
        title,
        description,
        priority,
        assignedTo,
        dueDate,
        status,
        inventoryItems
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Update work order error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while updating work order')
      );
    }
  }
  
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const result = await WorkOrder.delete(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Delete work order error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while deleting work order')
      );
    }
  }
  
  static async getCalendarData(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json(
          formatResponse(false, 'Start date and end date are required')
        );
      }
      
      const result = await WorkOrder.getCalendarData(startDate, endDate);
      res.json(result);
    } catch (error) {
      console.error('Get calendar data error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving calendar data')
      );
    }
  }
}

module.exports = ProductionController;