const User = require('../models/User');
const jwt = require('../utils/jwt');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log(`Login attempt for email: ${email}`);
    
    // Find user by email
    const user = await User.findByEmail(email);
    console.log(`User found:`, user);
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    console.log(`Verifying password for user:`, user.email);
    console.log(`Input password:`, password);
    console.log(`Stored password hash:`, user.password);
    
    const isPasswordValid = await User.verifyPassword(password, user.password);
    console.log(`Password valid:`, isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
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