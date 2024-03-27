const express = require('express');
const router = express.Router();
const user = require('../models/user');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.post('/user/signup', validation.signup, user.signup);
router.post('/user/login', validation.login, user.login);
router.get('/user/:id', authMiddleware.verifyToken, user.getUserById);
router.get('/user/', authMiddleware.authenticateUser, authMiddleware.verifyToken, user.getAllUser);
router.patch('/user/:id', validation.userUpdate, authMiddleware.verifyToken, user.updateUserDetail);
router.delete('/user/:id', authMiddleware.verifyToken, user.deleteUser);


module.exports = router;