const express = require('express');

const { updateProfile } = require('../controllers/userController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.patch('/me', asyncHandler(updateProfile));

module.exports = router;
