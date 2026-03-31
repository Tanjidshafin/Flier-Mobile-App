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

async function createBookingHold(req, res) {
  const data = await bookingService.createBookingHold(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Booking hold created successfully.',
    data,
  });
}

async function completeBooking(req, res) {
  const data = await bookingService.completeBooking(
    req.user._id,
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: 'Booking confirmed successfully.',
    data,
  });
}

async function cancelBooking(req, res) {
  const data = await bookingService.cancelBooking(
    req.user._id,
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully.',
    data,
  });
}

module.exports = {
  cancelBooking,
  completeBooking,
  createBooking,
  createBookingHold,
  getBookingDetails,
  listBookings,
};
