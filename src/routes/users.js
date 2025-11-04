const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Get all users (admin only)
router.get('/', auth, rbac(['admin']), UserController.getAll);

// Get user by ID (admin only)
router.get('/:id', auth, rbac(['admin']), UserController.getById);

// Update user (admin only)
router.put('/:id', auth, rbac(['admin']), UserController.update);

// Delete user (admin only)
router.delete('/:id', auth, rbac(['admin']), UserController.delete);

module.exports = router;