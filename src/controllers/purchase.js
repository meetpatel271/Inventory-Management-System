const express = require('express');
const router = express.Router();
const purchase = require('../models/purchase');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.post('/purchase', validation.createPurchase, authMiddleware.verifyToken, purchase.createPurchase);
router.get('/purchase/:id', authMiddleware.verifyToken, purchase.getPurchaseById);
router.get('/purchase', authMiddleware.verifyToken, purchase.getAllPurchase);
router.delete('/purchase/:id', authMiddleware.verifyToken, purchase.deletePurchase);

module.exports = router;
