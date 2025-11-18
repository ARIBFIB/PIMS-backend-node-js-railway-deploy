const PurchaseOrder = require('../models/PurchaseOrder');

const getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PurchaseOrder.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items } = req.body;
    
    // Validate input
    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Supplier ID and items are required' });
    }
    
    const order = await PurchaseOrder.create({
      supplierId,
      items
    });
    
    res.status(201).json({ message: 'Purchase order created successfully', order });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierId, items } = req.body;
    
    // Validate input
    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Supplier ID and items are required' });
    }
    
    const order = await PurchaseOrder.update(id, {
      supplierId,
      items
    });
    
    res.json({ message: 'Purchase order updated successfully', order });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await PurchaseOrder.approve(id);
    
    res.json({ message: 'Purchase order approved successfully', result });
  } catch (error) {
    console.error('Approve purchase order error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if order exists
    const order = await PurchaseOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // Delete the order
    const deleted = await PurchaseOrder.delete(id);
    if (deleted) {
      res.json({ message: 'Purchase order deleted successfully', orderNumber: order.orderNumber });
    } else {
      res.status(500).json({ message: 'Failed to delete purchase order' });
    }
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const disapprovePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await PurchaseOrder.disapprove(id);
    
    res.json({ message: 'Purchase order disapproved successfully', result });
  } catch (error) {
    console.error('Disapprove purchase order error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  approvePurchaseOrder,
  deletePurchaseOrder,
  disapprovePurchaseOrder
};