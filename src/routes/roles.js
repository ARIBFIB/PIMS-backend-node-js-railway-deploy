const express = require('express');
const { body, param } = require('express-validator');
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get all roles (admin only)
router.get('/', 
  authMiddleware.authorize('admin'),
  roleController.getAllRoles
);

// Get role by ID (admin only)
router.get('/:id',
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Role ID must be an integer'),
  roleController.getRoleById
);

// Create role (admin only)
router.post('/', [
  authMiddleware.authorize('admin'),
  body('name').isLength({ min: 1 }).withMessage('Role name is required'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description must be less than 255 characters')
], roleController.createRole);

// Update role (admin only)
router.put('/:id', [
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Role ID must be an integer'),
  body('name').optional().isLength({ min: 1 }).withMessage('Role name is required'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description must be less than 255 characters')
], roleController.updateRole);

// Delete role (admin only)
router.delete('/:id',
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Role ID must be an integer'),
  roleController.deleteRole
);

// Get role permissions (admin only)
router.get('/:id/permissions',
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Role ID must be an integer'),
  roleController.getRolePermissions
);

// Assign permission to role (admin only)
router.post('/:id/permissions/:permissionId',
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Role ID must be an integer'),
  param('permissionId').isInt().withMessage('Permission ID must be an integer'),
  roleController.assignPermissionToRole
);

// Remove permission from role (admin only)
router.delete('/:id/permissions/:permissionId',
  authMiddleware.authorize('admin'),
  param('id').isInt().withMessage('Role ID must be an integer'),
  param('permissionId').isInt().withMessage('Permission ID must be an integer'),
  roleController.removePermissionFromRole
);

module.exports = router;