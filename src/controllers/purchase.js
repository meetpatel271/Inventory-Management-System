const express = require('express');
const router = express.Router();
const purchase = require('../models/purchase');

router.post('/purchase', purchase.createPurchase);
router.get('/purchase/:id', purchase.getPurchaseById);

module.exports = router;
