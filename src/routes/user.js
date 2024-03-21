const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

router.post('/user/signup', user.signup);
router.post('/user/login', user.login);
router.get('/user/:id', authMiddleware.verifyToken, user.getUserById);
router.get('/user/', [authMiddleware.authenticateUser, authMiddleware.verifyToken], user.getAllUser);
router.patch('/user/:id', authMiddleware.verifyToken, user.updateUserDetail);
router.delete('/user/:id', authMiddleware.verifyToken, user.deleteUser);


module.exports = router;