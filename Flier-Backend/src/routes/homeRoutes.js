const express = require('express');

const { getHome } = require('../controllers/hotelController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(getHome));

module.exports = router;
