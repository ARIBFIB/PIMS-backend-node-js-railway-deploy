const express = require('express');
const { body } = require('express-validator');
const materialController = require('../controllers/materialController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET ROUTES
router.get('/', authenticate, materialController.getAllMaterials);
router.get('/low-stock', authenticate, materialController.getLowStockItems);
router.get('/:id', authenticate, materialController.getMaterialById);
router.get('/:id/usage', authenticate, materialController.checkMaterialUsage);

// CREATE MATERIAL
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Material name is required'),

    // unit is optional now
    body('unit').optional().isString(),

    // quantity + unitPrice removed as they are not in your form anymore
    // body('quantity')
    // body('unitPrice')

    body('lowStockThreshold')
      .isNumeric()
      .withMessage('Low stock threshold must be a number'),

    // Allow NULL values
    body('categoryId').optional({ nullable: true }),
    body('subCategoryId').optional({ nullable: true }),
    body('uomId').optional({ nullable: true }),
  ],
  materialController.createMaterial
);

// UPDATE MATERIAL
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().isString(),

    // unit optional
    body('unit').optional(),

    body('lowStockThreshold')
      .optional()
      .isNumeric()
      .withMessage('Low stock threshold must be a number'),

    body('categoryId').optional({ nullable: true }),
    body('subCategoryId').optional({ nullable: true }),
    body('uomId').optional({ nullable: true }),
  ],
  materialController.updateMaterial
);

// DELETE ROUTES
router.delete('/:id', authenticate, materialController.deleteMaterial);
router.delete('/', authenticate, materialController.deleteAllMaterials);

module.exports = router;