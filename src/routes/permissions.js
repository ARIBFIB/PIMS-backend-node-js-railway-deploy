const express = require('express');
const { body, param } = require('express-validator');
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get all permissions (requires view_permissions permission)
router.get('/', 
  authMiddleware.checkPermission('view_permissions'),
  permissionController.getAllPermissions
);

// Get permission by ID (requires view_permissions permission)
router.get('/:id',
  authMiddleware.checkPermission('view_permissions'),
  param('id').isInt().withMessage('Permission ID must be an integer'),
  permissionController.getPermissionById
);

// Create permission (admin only)
router.post('/', [
  authMiddleware.authorize('admin'),
  body('name').isLength({ min: 1 }).withMessage('Permission name is required'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description must be less than 255 characters')
], permissionController.createPermission);

// Update permission (admin only)
router.put('/:id', [
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Permission ID must be an integer'),
  body('name').optional().isLength({ min: 1 }).withMessage('Permission name is required'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description must be less than 255 characters')
], permissionController.updatePermission);

// Delete permission (admin only)
router.delete('/:id',
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Permission ID must be an integer'),
  permissionController.deletePermission
);

module.exports = router;