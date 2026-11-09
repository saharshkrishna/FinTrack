const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify', authController.verifyToken);
router.delete('/account', authMiddleware, authController.deleteAccount);

module.exports = router;
