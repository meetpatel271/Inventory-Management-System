const express = require('express');
const router = express.Router();
const sale = require('../models/sale');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.post('/sale', validation.createSale, authMiddleware.verifyToken, sale.createSale);
router.get('/sale/:id', authMiddleware.verifyToken, sale.getSaleById);
router.get('/sale', authMiddleware.verifyToken, sale.getAllSale);
router.delete('/sale/:id', authMiddleware.verifyToken, sale.deleteSale)

module.exports = router;

