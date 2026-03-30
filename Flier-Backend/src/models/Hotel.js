const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, required: true },
    area: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    country: { type: String, trim: true, required: true },
    destinationId: { type: String, trim: true, required: true, index: true },
  },
  { _id: false },
);

const pricingSchema = new mongoose.Schema(
  {
    cleaningFee: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    nightlyRate: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.1 },
  },
  { _id: false },
);

const hotelSchema = new mongoose.Schema(
  {
    amenities: [{ type: String, trim: true }],
    availableRooms: { type: Number, required: true, min: 1 },
    baths: { type: Number, required: true, min: 1 },
    description: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false },
    featuredDestination: { type: Boolean, default: false },
    images: [{ type: String, required: true }],
    location: { type: locationSchema, required: true },
    maxGuests: { type: Number, required: true, min: 1 },
    name: { type: String, required: true, trim: true },
    policies: {
      cancellation: { type: String, required: true },
      checkInFrom: { type: String, required: true },
      checkOutUntil: { type: String, required: true },
      houseRules: [{ type: String, trim: true }],
    },
    pricing: { type: pricingSchema, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviewCount: { type: Number, required: true, min: 0 },
    rooms: { type: Number, required: true, min: 1 },
    shortDescription: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    squareMeters: { type: Number, required: true, min: 10 },
    tag: { type: String, default: null, trim: true },
  },
  {
    timestamps: true,
  },
);

module.exports = {
  Hotel: mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema),
};
