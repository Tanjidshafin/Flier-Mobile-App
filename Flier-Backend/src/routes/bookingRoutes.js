const express = require('express');

const {
  createBooking,
  getBookingDetails,
  listBookings,
} = require('../controllers/bookingController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.get('/', asyncHandler(listBookings));
router.get('/:id', asyncHandler(getBookingDetails));
router.post('/', asyncHandler(createBooking));

module.exports = router;
