const express = require('express');

const { getHealthStatus } = require('../controllers/healthController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/health', asyncHandler(getHealthStatus));

module.exports = router;
