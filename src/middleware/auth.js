const jwt = require('../utils/jwt');
const User = require('../models/User');

const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // If no roles specified, just require authentication
      if (roles.length === 0) {
        return next();
      }
      
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      
      // Check if user has required role
      if (roles.includes(req.user.role)) {
        return next();
      }
      
      // For more granular permission checking, we could also check individual permissions here
      // For now, we'll just check roles
      
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
};

// Check if user has specific permission
const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      
      // Get user permissions
      const userPermissions = await User.getPermissions(req.user.id);
      
      // Check if user has required permission
      if (userPermissions.includes(permissionName)) {
        return next();
      }
      
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission
};