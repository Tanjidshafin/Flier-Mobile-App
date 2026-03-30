const { differenceInCalendarDays } = require('date-fns');

const { Booking } = require('../models/Booking');
const { Hotel } = require('../models/Hotel');
const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const { validateBookingPayload } = require('../validators/bookingValidators');
const { buildLocationLabel } = require('./hotelService');

function buildConfirmationCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FLR-${random}`;
}

function calculatePricing(hotel, nights) {
  const baseAmount = hotel.pricing.nightlyRate * nights;
  const cleaningFee = hotel.pricing.cleaningFee;
  const serviceFee = hotel.pricing.serviceFee;
  const taxAmount = Math.round(baseAmount * hotel.pricing.taxRate);
  const totalAmount = baseAmount + cleaningFee + serviceFee + taxAmount;

  return {
    baseAmount,
    cleaningFee,
    currency: hotel.pricing.currency,
    serviceFee,
    taxAmount,
    totalAmount,
  };
}

function mapBooking(booking) {
  return {
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    confirmationCode: booking.confirmationCode,
    contactPhone: booking.contactPhone,
    createdAt: booking.createdAt,
    guests: booking.guests,
    hotel: booking.hotelSnapshot,
    id: booking._id.toString(),
    nights: booking.nights,
    pricing: booking.pricing,
    specialRequests: booking.specialRequests,
    status: booking.status,
  };
}

async function createBooking(userId, payload) {
  const validatedPayload = validateBookingPayload(payload);
  const [user, hotel] = await Promise.all([
    User.findById(userId),
    Hotel.findById(validatedPayload.hotelId),
  ]);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  const totalGuests = validatedPayload.adults + validatedPayload.children;

  if (totalGuests > hotel.maxGuests) {
    throw new AppError('Selected hotel cannot accommodate that many guests.', 400);
  }

  if (validatedPayload.rooms > hotel.availableRooms) {
    throw new AppError('Selected room count is not available.', 400);
  }

  const nights = differenceInCalendarDays(
    validatedPayload.checkOut,
    validatedPayload.checkIn,
  );

  if (nights < 1) {
    throw new AppError('A booking must be at least one night.', 400);
  }

  const contactPhone = validatedPayload.contactPhone || user.phoneNumber;

  if (!contactPhone) {
    throw new AppError('A contact phone number is required to confirm your booking.', 400);
  }

  if (!user.phoneNumber && validatedPayload.contactPhone) {
    user.phoneNumber = validatedPayload.contactPhone;
    await user.save();
  }

  const pricing = calculatePricing(hotel, nights);
  const booking = await Booking.create({
    checkIn: validatedPayload.checkIn,
    checkOut: validatedPayload.checkOut,
    confirmationCode: buildConfirmationCode(),
    contactPhone,
    guests: {
      adults: validatedPayload.adults,
      children: validatedPayload.children,
      rooms: validatedPayload.rooms,
    },
    hotel: hotel._id,
    hotelSnapshot: {
      coverImage: hotel.images[0],
      locationLabel: buildLocationLabel(hotel.location),
      name: hotel.name,
      nightlyRate: hotel.pricing.nightlyRate,
      slug: hotel.slug,
    },
    nights,
    pricing,
    specialRequests: validatedPayload.specialRequests,
    user: user._id,
  });

  return {
    booking: mapBooking(booking),
    user: {
      email: user.email,
      fullName: user.fullName,
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
    },
  };
}

async function listBookings(userId) {
  const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
  return bookings.map(mapBooking);
}

async function getBookingById(userId, bookingId) {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  return mapBooking(booking);
}

module.exports = {
  buildConfirmationCode,
  calculatePricing,
  createBooking,
  getBookingById,
  listBookings,
  mapBooking,
};
