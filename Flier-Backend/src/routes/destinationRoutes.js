const express = require('express');

const { getDestinationSuggestions } = require('../controllers/hotelController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/suggestions', asyncHandler(getDestinationSuggestions));

module.exports = router;
