const Role = require('../models/Role');
const Permission = require('../models/Permission');

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.getAll();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }
    
    // Check if role already exists
    const existingRole = await Role.findByName(name);
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }
    
    const roleData = {
      name,
      description: description || ''
    };
    
    const newRole = await Role.create(roleData);
    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate input
    if (!name && !description) {
      return res.status(400).json({ message: 'At least one field is required' });
    }
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if another role already has this name
    if (name) {
      const roleWithName = await Role.findByName(name);
      if (roleWithName && roleWithName.id !== parseInt(id)) {
        return res.status(400).json({ message: 'Role with this name already exists' });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    const updatedRole = await Role.update(id, updateData);
    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Prevent deleting system roles
    const systemRoles = ['admin', 'manager', 'operator'];
    if (systemRoles.includes(existingRole.name)) {
      return res.status(400).json({ message: 'Cannot delete system roles' });
    }
    
    await Role.delete(id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    const permissions = await Role.getPermissions(id);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const assignPermissionToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionId } = req.body;
    
    // Validate input
    if (!permissionId) {
      return res.status(400).json({ message: 'Permission ID is required' });
    }
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if permission exists
    const existingPermission = await Permission.findById(permissionId);
    if (!existingPermission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    await Role.assignPermission(id, permissionId);
    res.json({ message: 'Permission assigned to role successfully' });
  } catch (error) {
    console.error('Error assigning permission to role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const removePermissionFromRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionId } = req.body;
    
    // Validate input
    if (!permissionId) {
      return res.status(400).json({ message: 'Permission ID is required' });
    }
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if permission exists
    const existingPermission = await Permission.findById(permissionId);
    if (!existingPermission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    await Role.removePermission(id, permissionId);
    res.json({ message: 'Permission removed from role successfully' });
  } catch (error) {
    console.error('Error removing permission from role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole
};