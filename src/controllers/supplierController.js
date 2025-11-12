const Supplier = require('../models/Supplier');

const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json(suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, contact, email, phone, address } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }
    
    const supplier = await Supplier.create({
      name,
      contact,
      email,
      phone,
      address
    });
    
    res.status(201).json({ message: 'Supplier created successfully', supplier });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email, phone, address } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }
    
    const supplier = await Supplier.update(id, {
      name,
      contact,
      email,
      phone,
      address
    });
    
    res.json({ message: 'Supplier updated successfully', supplier });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if supplier exists
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Delete the supplier
    const deleted = await Supplier.delete(id);
    if (deleted) {
      res.json({ message: 'Supplier deleted successfully', name: supplier.name });
    } else {
      res.status(500).json({ message: 'Failed to delete supplier' });
    }
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};