const express = require('express');

const {
  getHotelDetails,
  listHotels,
} = require('../controllers/hotelController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listHotels));
router.get('/:slug', asyncHandler(getHotelDetails));

module.exports = router;
