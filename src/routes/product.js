const express = require('express');
const router = express.Router();
const product = require('../controllers/product');
const authMiddleware = require('../middleware/auth');

router.post('/product', authMiddleware.verifyToken, authMiddleware.authenticateUser, product.createProduct);
router.get('/product/:id', authMiddleware.verifyToken, product.getProductById);
router.get('/product', authMiddleware.verifyToken, product.getAllProduct);
router.patch('/product/:id', authMiddleware.verifyToken, authMiddleware.authenticateUser, product.updateProductDetail);
router.delete('/product/:id', product.deleteProduct, authMiddleware.verifyToken, authMiddleware.authenticateUser);
module.exports = router;

