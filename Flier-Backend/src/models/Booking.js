const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
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
    nights: { type: Number, required: true, min: 1 },
    pricing: {
      baseAmount: { type: Number, required: true },
      cleaningFee: { type: Number, required: true },
      currency: { type: String, required: true },
      serviceFee: { type: Number, required: true },
      taxAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
    },
    specialRequests: { type: String, default: '', trim: true },
    status: { type: String, default: 'confirmed', enum: ['confirmed'] },
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
