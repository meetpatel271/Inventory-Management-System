const express = require('express');
const router = express.Router();
const product = require('../models/product');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.post('/product', validation.createProduct, authMiddleware.verifyToken, authMiddleware.authenticateUser, product.createProduct);
router.get('/product/:id', authMiddleware.verifyToken, product.getProductById);
router.get('/product', authMiddleware.verifyToken, product.getAllProduct);
router.patch('/product/:id', validation.updateProduct, authMiddleware.verifyToken, authMiddleware.authenticateUser, product.updateProductDetail);
router.delete('/product/:id', product.deleteProduct, authMiddleware.verifyToken, authMiddleware.authenticateUser);
module.exports = router;

