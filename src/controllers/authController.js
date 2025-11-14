const User = require('../models/User');
const jwt = require('../utils/jwt');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password (length):', password ? password.length : 0);
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    console.log('User lookup result:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    console.log('Attempting password verification');
    console.log('Input password length:', password.length);
    console.log('Stored password (first 20 chars):', user.password.substring(0, 20));
    
    const isPasswordValid = await User.verifyPassword(password, user.password);
    console.log('Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('Login successful for user:', user.email);
    
    // Generate JWT token
    const token = jwt.generate({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Return token and user info (without password)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login
};