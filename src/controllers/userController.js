const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name && !email && !password) {
      return res.status(400).json({ message: 'At least one field is required' });
    }
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password; // In a real app, this should be hashed
    
    const updatedUser = await User.update(req.user.id, updateData);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Validate role
    const validRoles = ['admin', 'manager', 'operator'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const userData = {
      name,
      email,
      password,
      role: role || 'operator'
    };
    
    const newUser = await User.create(userData);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    
    // Validate input
    if (!name && !email && !password && !role) {
      return res.status(400).json({ message: 'At least one field is required' });
    }
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent editing of the default admin user
    if (existingUser.email === 'admin@example.com') {
      return res.status(400).json({ message: 'Cannot edit the default admin user' });
    }
    
    // Check if email is already taken by another user
    if (email) {
      const userWithEmail = await User.findByEmail(email);
      if (userWithEmail && userWithEmail.id !== id) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }
    
    // Validate role
    if (role) {
      const validRoles = ['admin', 'manager', 'operator'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (role !== undefined) updateData.role = role;
    
    const updatedUser = await User.update(id, updateData);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting the current user
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deletion of the default admin user
    if (existingUser.email === 'admin@example.com') {
      return res.status(400).json({ message: 'Cannot delete the default admin user' });
    }
    
    await User.delete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roles = await User.getRoles(id);
    res.json(roles);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const permissions = await User.getPermissions(id);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Assign a permission to a user
const assignPermissionToUser = async (req, res) => {
  try {
    const { id, permissionId } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    // Assign permission to user
    const result = await User.assignPermission(id, permissionId);
    res.json({ message: 'Permission assigned successfully', result });
  } catch (error) {
    console.error('Error assigning permission to user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a permission from a user
const removePermissionFromUser = async (req, res) => {
  try {
    const { id, permissionId } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    // Remove permission from user
    await User.removePermission(id, permissionId);
    res.json({ message: 'Permission removed successfully' });
  } catch (error) {
    console.error('Error removing permission from user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's custom permissions (not from roles)
const getUserCustomPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const permissions = await User.getCustomPermissions(id);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching user custom permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getProfile,
  updateProfile,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  getUserPermissions,
  assignPermissionToUser,
  removePermissionFromUser,
  getUserCustomPermissions
};