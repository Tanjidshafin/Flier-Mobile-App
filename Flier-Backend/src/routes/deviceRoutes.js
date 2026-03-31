const express = require('express');

const { registerDevice } = require('../controllers/deviceController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.post('/', asyncHandler(registerDevice));

module.exports = router;
