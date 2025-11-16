const jwt = require('../utils/jwt');
const User = require('../models/User');

const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Set CORS headers for error responses
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    // Set CORS headers for error responses
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
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
        // Set CORS headers for error responses
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      
      // Check if user has required role
      if (roles.includes(req.user.role)) {
        return next();
      }
      
      // For more granular permission checking, we could also check individual permissions here
      // For now, we'll just check roles
      
      // Set CORS headers for error responses
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    } catch (error) {
      // Set CORS headers for error responses
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
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
        // Set CORS headers for error responses
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      
      // Get user permissions
      const userPermissions = await User.getPermissions(req.user.id);
      
      // Check if user has required permission
      if (userPermissions.includes(permissionName)) {
        return next();
      }
      
      // Set CORS headers for error responses
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    } catch (error) {
      // Set CORS headers for error responses
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission
};