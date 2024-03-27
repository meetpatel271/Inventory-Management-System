const express = require('express');
const router = express.Router();
const category = require('../models/category');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.post('/category', validation.createCategory, authMiddleware.verifyToken, authMiddleware.authenticateUser, category.createCategory);
router.get('/category/:id', authMiddleware.verifyToken, category.getCategoryById);
router.get('/category', authMiddleware.verifyToken, category.getAllCategory);
router.patch('/category/:id', validation.updateCategory, authMiddleware.verifyToken, authMiddleware.authenticateUser, category.updateCategoryDetail);
router.delete('/category/:id', authMiddleware.verifyToken, authMiddleware.authenticateUser, category.deleteCategory);

module.exports = router;