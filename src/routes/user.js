const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

router.post('/user/signup', user.signup);
router.post('/user/login', user.login);
router.get('/user/:id', authMiddleware.authenticateUser, user.getUserById);
router.get('/user/', authMiddleware.authenticateUser, user.getAllUser);
router.patch('/user/:id', authMiddleware.authenticateUser, user.updateUserDetail);
router.delete('/user/:id', authMiddleware.authenticateUser, user.deleteUser);


module.exports = router;