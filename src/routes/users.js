const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get all users (requires view_users permission)
router.get('/', 
  authMiddleware.checkPermission('view_users'),
  userController.getAllUsers
);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update current user profile
router.put('/profile', [
  body('name').optional().isLength({ min: 1 }).withMessage('Name must be at least 1 character'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').optional().custom((value, { req }) => {
    if (req.body.password && value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], userController.updateProfile);

// Get user by ID (requires view_users permission)
router.get('/:id', 
  authMiddleware.checkPermission('view_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  userController.getUserById
);

// Create user (requires create_users permission)
router.post('/', [
  authMiddleware.checkPermission('create_users'),
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'manager', 'operator']).withMessage('Invalid role')
], userController.createUser);

// Update user (requires edit_users permission)
router.put('/:id', [
  authMiddleware.checkPermission('edit_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  body('name').optional().isLength({ min: 1 }).withMessage('Name must be at least 1 character'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'operator']).withMessage('Invalid role')
], userController.updateUser);

// Delete user (requires delete_users permission)
router.delete('/:id', 
  authMiddleware.checkPermission('delete_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  userController.deleteUser
);

// Get user roles (requires view_users permission)
router.get('/:id/roles',
  authMiddleware.checkPermission('view_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  userController.getUserRoles
);

// Get user permissions (requires view_users permission)
router.get('/:id/permissions',
  authMiddleware.checkPermission('view_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  userController.getUserPermissions
);

// Get user's custom permissions (not from roles)
router.get('/:id/custom-permissions',
  authMiddleware.checkPermission('view_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  userController.getUserCustomPermissions
);

// Assign permission to user
router.post('/:id/permissions/:permissionId',
  authMiddleware.checkPermission('edit_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  param('permissionId').isInt().withMessage('Permission ID must be an integer'),
  userController.assignPermissionToUser
);

// Remove permission from user
router.delete('/:id/permissions/:permissionId',
  authMiddleware.checkPermission('edit_users'),
  param('id').isInt().withMessage('User ID must be an integer'),
  param('permissionId').isInt().withMessage('Permission ID must be an integer'),
  userController.removePermissionFromUser
);

module.exports = router;