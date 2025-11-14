const Permission = require('../models/Permission');

const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.getAll();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findById(id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    res.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Permission name is required' });
    }
    
    // Check if permission already exists
    const existingPermission = await Permission.findByName(name);
    if (existingPermission) {
      return res.status(400).json({ message: 'Permission with this name already exists' });
    }
    
    // Prevent creating system permissions
    const systemPermissionPattern = /^(view_|create_|edit_|delete_|manage_)/;
    if (systemPermissionPattern.test(name)) {
      return res.status(400).json({ message: 'Cannot create system permissions' });
    }
    
    const permissionData = {
      name,
      description: description || ''
    };
    
    const newPermission = await Permission.create(permissionData);
    res.status(201).json(newPermission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate input
    if (!name && !description) {
      return res.status(400).json({ message: 'At least one field is required' });
    }
    
    // Check if permission exists
    const existingPermission = await Permission.findById(id);
    if (!existingPermission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    // Prevent updating system permissions
    const systemPermissionPattern = /^(view_|create_|edit_|delete_|manage_)/;
    if (systemPermissionPattern.test(existingPermission.name)) {
      return res.status(400).json({ message: 'Cannot update system permissions' });
    }
    
    // Check if another permission already has this name
    if (name) {
      const permissionWithName = await Permission.findByName(name);
      if (permissionWithName && permissionWithName.id !== parseInt(id)) {
        return res.status(400).json({ message: 'Permission with this name already exists' });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    const updatedPermission = await Permission.update(id, updateData);
    res.json(updatedPermission);
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if permission exists
    const existingPermission = await Permission.findById(id);
    if (!existingPermission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    // Prevent deleting system permissions
    const systemPermissionPattern = /^(view_|create_|edit_|delete_|manage_)/;
    if (systemPermissionPattern.test(existingPermission.name)) {
      return res.status(400).json({ message: 'Cannot delete system permissions' });
    }
    
    await Permission.delete(id);
    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission
};