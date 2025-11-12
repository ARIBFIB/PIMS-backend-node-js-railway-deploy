const Customer = require('../models/Customer');

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    
    const customer = await Customer.create({
      name,
      email,
      phone,
      address
    });
    
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    
    const customer = await Customer.update(id, {
      name,
      email,
      phone,
      address
    });
    
    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Delete the customer
    const deleted = await Customer.delete(id);
    if (deleted) {
      res.json({ message: 'Customer deleted successfully', name: customer.name });
    } else {
      res.status(500).json({ message: 'Failed to delete customer' });
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};