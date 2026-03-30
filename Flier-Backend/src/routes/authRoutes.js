const express = require('express');

const authController = require('../controllers/authController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', authenticateRequest, asyncHandler(authController.me));

module.exports = router;
