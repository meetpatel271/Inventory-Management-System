const express = require('express');
const router = express.Router();
const category = require('../controllers/category');
const authMiddleware = require('../middleware/auth');

router.post('/category', authMiddleware.verifyToken, authMiddleware.authenticateUser, category.createCategory);
router.get('/category/:id', authMiddleware.verifyToken, category.getCategoryById);
router.get('/category', authMiddleware.verifyToken, authMiddleware.authenticateUser, category.getAllCategory);
router.patch('/category/:id', authMiddleware.verifyToken, authMiddleware.authenticateUser, category.updateCategoryDetail);
router.delete('/category/:id', authMiddleware.verifyToken, authMiddleware.authenticateUser, category.deleteCategory);

module.exports = router;