const express = require('express');

const {
  cancelBooking,
  completeBooking,
  createBooking,
  createBookingHold,
  getBookingDetails,
  listBookings,
} = require('../controllers/bookingController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.get('/', asyncHandler(listBookings));
router.post('/hold', asyncHandler(createBookingHold));
router.get('/:id', asyncHandler(getBookingDetails));
router.post('/:id/complete', asyncHandler(completeBooking));
router.post('/:id/cancel', asyncHandler(cancelBooking));
router.post('/', asyncHandler(createBooking));

module.exports = router;
