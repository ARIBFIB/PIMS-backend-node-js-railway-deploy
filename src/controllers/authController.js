const User = require('../models/User');
const { sign } = require('../utils/jwt');
const { formatResponse, isValidEmail, isValidPassword } = require('../utils/helpers');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;
      
      // Validation
      if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json(
          formatResponse(false, 'All fields are required')
        );
      }
      
      if (!isValidEmail(email)) {
        return res.status(400).json(
          formatResponse(false, 'Please provide a valid email')
        );
      }
      
      if (!isValidPassword(password)) {
        return res.status(400).json(
          formatResponse(false, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number')
        );
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json(
          formatResponse(false, 'Passwords do not match')
        );
      }
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json(
          formatResponse(false, 'User with this email already exists')
        );
      }
      
      // Determine role based on email
      const role = email.includes('admin') ? 'admin' : 'staff';
      
      // Create user
      const result = await User.create({
        name,
        email,
        password,
        role
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      // Generate JWT
      const token = sign({
        id: result.data.id,
        email: result.data.email,
        role: result.data.role
      });
      
      res.status(201).json(
        formatResponse(true, 'User registered successfully', {
          user: result.data,
          token
        })
      );
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error during registration')
      );
    }
  }
  
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validation
      if (!email || !password) {
        return res.status(400).json(
          formatResponse(false, 'Email and password are required')
        );
      }
      
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json(
          formatResponse(false, 'Invalid credentials')
        );
      }
      
      // Check password
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json(
          formatResponse(false, 'Invalid credentials')
        );
      }
      
      // Generate JWT
      const token = sign({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(
        formatResponse(true, 'Login successful', {
          user: userWithoutPassword,
          token
        })
      );
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error during login')
      );
    }
  }
  
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json(
          formatResponse(false, 'User not found')
        );
      }
      
      res.json(
        formatResponse(true, 'Profile retrieved successfully', user)
      );
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json(
        formatResponse(false, 'Server error while retrieving profile')
      );
    }
  }
}

module.exports = AuthController;