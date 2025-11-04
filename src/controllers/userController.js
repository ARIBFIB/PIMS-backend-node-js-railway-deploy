const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');

class UserController {
  static async getAll(req, res) {
    try {
      const { page = 0, size = 10 } = req.query;
      
      const result = await User.getAll(
        parseInt(page),
        parseInt(size)
      );
      
      res.json(
        formatResponse(true, 'Users retrieved successfully', result)
      );
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving users')
      );
    }
  }
  
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json(
          formatResponse(false, 'User not found')
        );
      }
      
      res.json(
        formatResponse(true, 'User retrieved successfully', user)
      );
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving user')
      );
    }
  }
  
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      
      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json(
          formatResponse(false, 'User not found')
        );
      }
      
      const result = await User.update(id, {
        name,
        email,
        role
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while updating user')
      );
    }
  }
  
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent self-deletion
      if (parseInt(id) === req.user.id) {
        return res.status(400).json(
          formatResponse(false, 'You cannot delete your own account')
        );
      }
      
      const result = await User.delete(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while deleting user')
      );
    }
  }
}

module.exports = UserController;