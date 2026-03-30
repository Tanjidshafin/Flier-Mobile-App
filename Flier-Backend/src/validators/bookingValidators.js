const { AppError } = require('../utils/AppError');
const { normalizePhoneNumber } = require('../utils/normalizePhoneNumber');

function validateBookingPayload(body) {
  const hotelId = String(body.hotelId || '').trim();
  const specialRequests = String(body.specialRequests || '').trim();
  const adults = Number(body.adults);
  const children = Number(body.children || 0);
  const rooms = Number(body.rooms);
  const contactPhone = body.contactPhone
    ? normalizePhoneNumber(body.contactPhone)
    : null;
  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);

  if (!hotelId) {
    throw new AppError('Hotel id is required.', 400);
  }

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    throw new AppError('A valid check-in and check-out date range is required.', 400);
  }

  if (checkOut <= checkIn) {
    throw new AppError('Check-out must be after check-in.', 400);
  }

  if (!Number.isInteger(adults) || adults < 1) {
    throw new AppError('At least one adult guest is required.', 400);
  }

  if (!Number.isInteger(children) || children < 0) {
    throw new AppError('Children count must be zero or greater.', 400);
  }

  if (!Number.isInteger(rooms) || rooms < 1) {
    throw new AppError('At least one room is required.', 400);
  }

  return {
    adults,
    checkIn,
    checkOut,
    children,
    contactPhone,
    hotelId,
    rooms,
    specialRequests,
  };
}

module.exports = {
  validateBookingPayload,
};
