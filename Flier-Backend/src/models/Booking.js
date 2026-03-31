const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    cancellationReason: { default: '', trim: true, type: String },
    cancelledAt: { default: null, type: Date },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    confirmationCode: { type: String, required: true, unique: true },
    contactPhone: { type: String, required: true },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, required: true, min: 0 },
      rooms: { type: Number, required: true, min: 1 },
    },
    hotel: {
      ref: 'Hotel',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    hotelSnapshot: {
      coverImage: { type: String, required: true },
      locationLabel: { type: String, required: true },
      name: { type: String, required: true },
      nightlyRate: { type: Number, required: true },
      slug: { type: String, required: true },
    },
    holdExpiresAt: { default: null, type: Date },
    idempotencyKeys: {
      cancel: { default: null, trim: true, type: String },
      complete: { default: null, trim: true, type: String },
      hold: { default: null, trim: true, type: String },
    },
    nights: { type: Number, required: true, min: 1 },
    payment: {
      amount: { default: 0, min: 0, type: Number },
      clientSecret: { default: null, trim: true, type: String },
      currency: { default: 'USD', trim: true, type: String },
      ephemeralKeySecret: { default: null, trim: true, type: String },
      lastError: { default: '', trim: true, type: String },
      paymentIntentId: { default: null, trim: true, type: String },
      provider: { default: 'mock', trim: true, type: String },
      publishableKey: { default: null, trim: true, type: String },
      refundId: { default: null, trim: true, type: String },
      refundedAt: { default: null, type: Date },
      stripeCustomerId: { default: null, trim: true, type: String },
      paidAt: { default: null, type: Date },
    },
    paymentStatus: {
      default: 'pending',
      enum: ['pending', 'paid', 'failed', 'refunded'],
      type: String,
    },
    pricing: {
      baseAmount: { type: Number, required: true },
      cleaningFee: { type: Number, required: true },
      currency: { type: String, required: true },
      serviceFee: { type: Number, required: true },
      taxAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
    },
    roomCount: { default: 1, min: 1, type: Number },
    roomTypeId: { default: 'default-room', trim: true, type: String },
    roomTypeSnapshot: {
      amenities: [{ type: String, trim: true }],
      beds: { default: 1, min: 1, type: Number },
      code: { default: 'default-room', trim: true, type: String },
      image: { default: null, trim: true, type: String },
      maxGuests: { default: 1, min: 1, type: Number },
      name: { default: 'Room', trim: true, type: String },
      nightlyRate: { default: 0, min: 0, type: Number },
    },
    specialRequests: { type: String, default: '', trim: true },
    status: {
      type: String,
      default: 'confirmed',
      enum: [
        'pending_payment',
        'confirmed',
        'cancelled',
        'payment_failed',
        'expired',
      ],
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = {
  Booking: mongoose.models.Booking || mongoose.model('Booking', bookingSchema),
};
