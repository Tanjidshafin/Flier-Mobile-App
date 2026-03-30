const bookingService = require('../services/bookingService');

async function listBookings(req, res) {
  const data = await bookingService.listBookings(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Bookings fetched successfully.',
    data,
  });
}

async function getBookingDetails(req, res) {
  const data = await bookingService.getBookingById(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Booking details fetched successfully.',
    data,
  });
}

async function createBooking(req, res) {
  const data = await bookingService.createBooking(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully.',
    data,
  });
}

module.exports = {
  createBooking,
  getBookingDetails,
  listBookings,
};
