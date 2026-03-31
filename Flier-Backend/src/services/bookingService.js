const { randomUUID } = require('crypto');
const { differenceInCalendarDays } = require('date-fns');

const { Booking } = require('../models/Booking');
const { Hotel } = require('../models/Hotel');
const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const {
  validateBookingActionPayload,
  validateBookingPayload,
} = require('../validators/bookingValidators');
const { buildLocationLabel, getRoomTypes } = require('./hotelService');
const { createAdminNotifications, createNotification } = require('./notificationService');
const {
  cancelPaymentIntent,
  createPaymentSession,
  refundPaymentIntent,
  retrievePaymentIntent,
} = require('./paymentService');

const HOLD_WINDOW_MS = 15 * 60 * 1000;

function buildConfirmationCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FLR-${random}`;
}

function buildHotelSnapshot(hotel) {
  return {
    coverImage: hotel.images[0] || null,
    locationLabel: buildLocationLabel(hotel.location),
    name: hotel.name,
    nightlyRate: hotel.pricing.nightlyRate,
    slug: hotel.slug,
  };
}

function calculatePricing(hotel, nights, roomType, roomCount) {
  const nightlyRate = roomType?.nightlyRate || hotel.pricing.nightlyRate;
  const units = roomCount || 1;
  const baseAmount = nightlyRate * nights * units;
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
    bookingStatus: booking.status,
    canCancel:
      booking.status === 'pending_payment' ||
      (booking.status === 'confirmed' && new Date(booking.checkIn) > new Date()),
    cancelledAt: booking.cancelledAt,
    cancellationReason: booking.cancellationReason || '',
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    confirmationCode: booking.confirmationCode,
    contactPhone: booking.contactPhone,
    createdAt: booking.createdAt,
    guests: booking.guests,
    holdExpiresAt: booking.holdExpiresAt,
    hotel: booking.hotelSnapshot,
    id: booking._id.toString(),
    nights: booking.nights,
    payment: {
      amount: booking.payment?.amount || booking.pricing.totalAmount,
      currency: booking.payment?.currency || booking.pricing.currency,
      lastError: booking.payment?.lastError || '',
      paidAt: booking.payment?.paidAt || null,
      paymentIntentId: booking.payment?.paymentIntentId || null,
      provider: booking.payment?.provider || 'mock',
    },
    paymentStatus: booking.paymentStatus,
    pricing: booking.pricing,
    roomCount: booking.roomCount || booking.guests?.rooms || 1,
    roomType: {
      amenities: booking.roomTypeSnapshot?.amenities || [],
      beds: booking.roomTypeSnapshot?.beds || 1,
      code: booking.roomTypeSnapshot?.code || booking.roomTypeId || 'signature-suite',
      image: booking.roomTypeSnapshot?.image || booking.hotelSnapshot?.coverImage || null,
      maxGuests: booking.roomTypeSnapshot?.maxGuests || booking.guests?.adults || 1,
      name: booking.roomTypeSnapshot?.name || 'Room',
      nightlyRate:
        booking.roomTypeSnapshot?.nightlyRate || booking.hotelSnapshot?.nightlyRate || 0,
    },
    roomTypeId: booking.roomTypeId || booking.roomTypeSnapshot?.code || 'signature-suite',
    specialRequests: booking.specialRequests,
    status: booking.status,
  };
}

async function expirePendingBookings() {
  await Booking.updateMany(
    {
      holdExpiresAt: { $lte: new Date() },
      status: 'pending_payment',
    },
    {
      paymentStatus: 'failed',
      status: 'expired',
    },
  );
}

function getRoomTypeOrThrow(hotel, roomTypeId) {
  const roomType = getRoomTypes(hotel).find(item => item.code === roomTypeId);

  if (!roomType) {
    throw new AppError('Selected room type is not available.', 400);
  }

  return roomType;
}

async function countReservedUnits({
  checkIn,
  checkOut,
  hotelId,
  ignoreBookingId,
  roomTypeId,
}) {
  const filters = {
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    hotel: hotelId,
    roomTypeId,
    status: { $in: ['pending_payment', 'confirmed'] },
    $or: [{ status: 'confirmed' }, { holdExpiresAt: { $gt: new Date() } }],
  };

  if (ignoreBookingId) {
    filters._id = { $ne: ignoreBookingId };
  }

  const bookings = await Booking.find(filters);

  return (bookings || []).reduce(
    (sum, booking) => sum + (booking.roomCount || booking.guests?.rooms || 1),
    0,
  );
}

async function assertAvailability({ bookingId, hotel, payload }) {
  const roomType = getRoomTypeOrThrow(hotel, payload.roomTypeId);
  const totalGuests = payload.adults + payload.children;
  const roomCount = payload.roomCount || payload.rooms || 1;

  if (totalGuests > roomType.maxGuests * roomCount) {
    throw new AppError('Selected hotel cannot accommodate that many guests.', 400);
  }

  if (roomCount > roomType.availableUnits) {
    throw new AppError('Selected room count exceeds the available room inventory.', 400);
  }

  const reservedUnits = await countReservedUnits({
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    hotelId: hotel._id,
    ignoreBookingId: bookingId,
    roomTypeId: roomType.code,
  });

  if (reservedUnits + roomCount > roomType.availableUnits) {
    throw new AppError('Selected room count is no longer available for these dates.', 409);
  }

  return roomType;
}

async function ensureUserAndHotel(userId, payload) {
  const [user, hotel] = await Promise.all([
    User.findById(userId),
    Hotel.findById(payload.hotelId),
  ]);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  if (hotel.status === 'archived') {
    throw new AppError('Hotel not found.', 404);
  }

  return { hotel, user };
}

async function resolveContactPhone(user, payload) {
  const contactPhone = payload.contactPhone || user.phoneNumber;

  if (!contactPhone) {
    throw new AppError('A contact phone number is required to confirm your booking.', 400);
  }

  if (payload.contactPhone && payload.contactPhone !== user.phoneNumber) {
    user.phoneNumber = payload.contactPhone;
    await user.save();
  }

  return contactPhone;
}

function buildRoomTypeSnapshot(roomType) {
  return {
    amenities: roomType.amenities || [],
    beds: roomType.beds,
    code: roomType.code,
    image: roomType.image || null,
    maxGuests: roomType.maxGuests,
    name: roomType.name,
    nightlyRate: roomType.nightlyRate,
  };
}

function buildHoldResponse(booking, paymentSession) {
  return {
    booking: mapBooking(booking),
    paymentSession: {
      customerId: paymentSession.customerId,
      ephemeralKeySecret: paymentSession.ephemeralKeySecret,
      merchantDisplayName: 'Flier',
      paymentIntentClientSecret: paymentSession.paymentIntentClientSecret,
      paymentIntentId: paymentSession.paymentIntentId,
      provider: paymentSession.provider,
      publishableKey: paymentSession.publishableKey,
    },
  };
}

async function createBookingHold(userId, payload) {
  await expirePendingBookings();

  const validatedPayload = validateBookingPayload(payload);
  const idempotencyKey =
    validatedPayload.idempotencyKey || `hold-${randomUUID()}`;
  const existingBooking = await Booking.findOne({
    'idempotencyKeys.hold': idempotencyKey,
    user: userId,
  });

  if (existingBooking) {
    return buildHoldResponse(existingBooking, {
      customerId: existingBooking.payment?.stripeCustomerId || null,
      ephemeralKeySecret: existingBooking.payment?.ephemeralKeySecret || null,
      paymentIntentClientSecret: existingBooking.payment?.clientSecret || null,
      paymentIntentId: existingBooking.payment?.paymentIntentId || null,
      provider: existingBooking.payment?.provider || 'mock',
      publishableKey: existingBooking.payment?.publishableKey || null,
    });
  }

  const { hotel, user } = await ensureUserAndHotel(userId, validatedPayload);
  const roomType = await assertAvailability({ hotel, payload: validatedPayload });
  const nights = differenceInCalendarDays(
    validatedPayload.checkOut,
    validatedPayload.checkIn,
  );

  if (nights < 1) {
    throw new AppError('A booking must be at least one night.', 400);
  }

  const contactPhone = await resolveContactPhone(user, validatedPayload);
  const pricing = calculatePricing(
    hotel,
    nights,
    roomType,
    validatedPayload.roomCount,
  );
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
    holdExpiresAt: new Date(Date.now() + HOLD_WINDOW_MS),
    hotel: hotel._id,
    hotelSnapshot: buildHotelSnapshot(hotel),
    idempotencyKeys: {
      hold: idempotencyKey,
    },
    nights,
    payment: {
      amount: pricing.totalAmount,
      currency: pricing.currency,
      provider: 'mock',
    },
    paymentStatus: 'pending',
    pricing,
    roomCount: validatedPayload.roomCount,
    roomTypeId: roomType.code,
    roomTypeSnapshot: buildRoomTypeSnapshot(roomType),
    specialRequests: validatedPayload.specialRequests,
    status: 'pending_payment',
    user: user._id,
  });

  const paymentSession = await createPaymentSession({
    amount: pricing.totalAmount * 100,
    booking,
    currency: pricing.currency,
    idempotencyKey: `payment-${idempotencyKey}`,
    user,
  });

  booking.payment = {
    ...booking.payment,
    clientSecret: paymentSession.paymentIntentClientSecret,
    currency: pricing.currency,
    ephemeralKeySecret: paymentSession.ephemeralKeySecret,
    paymentIntentId: paymentSession.paymentIntentId,
    provider: paymentSession.provider,
    publishableKey: paymentSession.publishableKey,
    stripeCustomerId: paymentSession.customerId,
  };
  await booking.save();

  return buildHoldResponse(booking, paymentSession);
}

async function completeBooking(userId, bookingId, payload) {
  await expirePendingBookings();

  const action = validateBookingActionPayload(payload);
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  if (
    booking.status === 'confirmed' &&
    action.idempotencyKey &&
    booking.idempotencyKeys?.complete === action.idempotencyKey
  ) {
    return mapBooking(booking);
  }

  if (booking.status === 'expired') {
    throw new AppError('This payment session expired. Please start again.', 409);
  }

  if (booking.status === 'cancelled') {
    throw new AppError('This booking has already been cancelled.', 409);
  }

  const hotel = await Hotel.findById(booking.hotel);

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  await assertAvailability({
    bookingId: booking._id,
    hotel,
    payload: {
      adults: booking.guests.adults,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      children: booking.guests.children,
      roomCount: booking.roomCount,
      roomTypeId: booking.roomTypeId,
    },
  });

  const paymentIntentId =
    action.paymentIntentId || booking.payment?.paymentIntentId || null;
  const paymentIntent = await retrievePaymentIntent(paymentIntentId);

  if (
    booking.payment?.provider === 'stripe' &&
    paymentIntent?.status !== 'succeeded'
  ) {
    booking.payment.lastError = `Stripe payment status is ${paymentIntent?.status || 'unknown'}.`;
    booking.paymentStatus = 'failed';
    booking.status = 'payment_failed';
    await booking.save();
    throw new AppError('Payment has not been completed yet.', 409);
  }

  booking.holdExpiresAt = null;
  booking.idempotencyKeys.complete =
    action.idempotencyKey || booking.idempotencyKeys.complete || `complete-${randomUUID()}`;
  booking.payment.paidAt = new Date();
  booking.payment.paymentIntentId = paymentIntentId;
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  await booking.save();

  await createNotification({
    body: `${booking.hotelSnapshot.name} is confirmed for your upcoming stay.`,
    data: {
      bookingId: booking._id.toString(),
      hotelSlug: booking.hotelSnapshot.slug,
      routeName: 'BookingSuccess',
    },
    title: 'Booking confirmed',
    type: 'booking_update',
    userId,
  });

  await createAdminNotifications({
    body: `${booking.hotelSnapshot.name} was booked and payment completed.`,
    data: {
      bookingId: booking._id.toString(),
      hotelSlug: booking.hotelSnapshot.slug,
      routeName: 'AdminDashboard',
    },
    title: 'New confirmed booking',
    type: 'booking_update',
  });

  return mapBooking(booking);
}

async function cancelBooking(userId, bookingId, payload) {
  await expirePendingBookings();

  const action = validateBookingActionPayload(payload);
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  if (
    booking.status === 'cancelled' &&
    action.idempotencyKey &&
    booking.idempotencyKeys?.cancel === action.idempotencyKey
  ) {
    return mapBooking(booking);
  }

  if (booking.status === 'expired') {
    throw new AppError('Expired bookings cannot be cancelled.', 409);
  }

  const hotel = await Hotel.findById(booking.hotel);
  const cancellationWindowHours = hotel?.cancellationWindowHours || 48;
  const hoursUntilCheckIn =
    (new Date(booking.checkIn).getTime() - Date.now()) / (60 * 60 * 1000);

  if (
    booking.status === 'confirmed' &&
    hoursUntilCheckIn < cancellationWindowHours
  ) {
    throw new AppError(
      `This booking can only be cancelled at least ${cancellationWindowHours} hours before check-in.`,
      409,
    );
  }

  if (booking.payment?.paymentIntentId) {
    if (booking.status === 'pending_payment') {
      await cancelPaymentIntent(booking.payment.paymentIntentId);
      booking.paymentStatus = 'failed';
    }

    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      const refund = await refundPaymentIntent(booking.payment.paymentIntentId);
      booking.payment.refundedAt = new Date();
      booking.payment.refundId = refund.id;
      booking.paymentStatus = 'refunded';
    }
  }

  booking.cancelledAt = new Date();
  booking.cancellationReason = action.reason || 'Cancelled by user';
  booking.holdExpiresAt = null;
  booking.idempotencyKeys.cancel =
    action.idempotencyKey || booking.idempotencyKeys.cancel || `cancel-${randomUUID()}`;
  booking.status = 'cancelled';
  await booking.save();

  await createNotification({
    body: `${booking.hotelSnapshot.name} has been cancelled successfully.`,
    data: {
      bookingId: booking._id.toString(),
      hotelSlug: booking.hotelSnapshot.slug,
      routeName: 'Profile',
    },
    title: 'Booking cancelled',
    type: 'booking_update',
    userId,
  });

  return mapBooking(booking);
}

async function createBooking(userId, payload) {
  const validatedPayload = validateBookingPayload(payload);
  const { hotel, user } = await ensureUserAndHotel(userId, validatedPayload);
  const roomType = await assertAvailability({ hotel, payload: validatedPayload });
  const nights = differenceInCalendarDays(
    validatedPayload.checkOut,
    validatedPayload.checkIn,
  );

  if (nights < 1) {
    throw new AppError('A booking must be at least one night.', 400);
  }

  const contactPhone = await resolveContactPhone(user, validatedPayload);
  const pricing = calculatePricing(
    hotel,
    nights,
    roomType,
    validatedPayload.roomCount,
  );
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
    hotelSnapshot: buildHotelSnapshot(hotel),
    nights,
    payment: {
      amount: pricing.totalAmount,
      currency: pricing.currency,
      paidAt: new Date(),
      provider: 'mock',
    },
    paymentStatus: 'paid',
    pricing,
    roomCount: validatedPayload.roomCount,
    roomTypeId: roomType.code,
    roomTypeSnapshot: buildRoomTypeSnapshot(roomType),
    specialRequests: validatedPayload.specialRequests,
    status: 'confirmed',
    user: user._id,
  });

  await createAdminNotifications({
    body: `${booking.hotelSnapshot.name} was booked successfully.`,
    data: {
      bookingId: booking._id.toString(),
      hotelSlug: booking.hotelSnapshot.slug,
      routeName: 'AdminDashboard',
    },
    title: 'New confirmed booking',
    type: 'booking_update',
  });

  return {
    booking: mapBooking(booking),
    user: {
      avatar: user.avatar || { publicId: null, url: null },
      createdAt: user.createdAt,
      email: user.email,
      fullName: user.fullName,
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
      role: user.role || 'user',
      status: user.status || 'active',
    },
  };
}

async function listBookings(userId) {
  await expirePendingBookings();
  const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
  return bookings.map(mapBooking);
}

async function getBookingById(userId, bookingId) {
  await expirePendingBookings();
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  return mapBooking(booking);
}

module.exports = {
  HOLD_WINDOW_MS,
  buildConfirmationCode,
  calculatePricing,
  cancelBooking,
  completeBooking,
  createBooking,
  createBookingHold,
  expirePendingBookings,
  getBookingById,
  listBookings,
  mapBooking,
};
