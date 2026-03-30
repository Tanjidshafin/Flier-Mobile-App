const { Hotel } = require('../models/Hotel');
const { WishlistItem } = require('../models/WishlistItem');
const { AppError } = require('../utils/AppError');
const { mapHotelCard } = require('./hotelService');

async function readWishlist(userId) {
  const items = await WishlistItem.find({ user: userId })
    .populate('hotel')
    .sort({ createdAt: -1 });

  return items
    .filter(item => item.hotel)
    .map(item => ({
      hotel: mapHotelCard(item.hotel),
      id: item._id.toString(),
      savedAt: item.createdAt,
    }));
}

async function ensureHotelExists(hotelId) {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  return hotel;
}

async function getWishlist(userId) {
  return readWishlist(userId);
}

async function addWishlistItem(userId, hotelId) {
  await ensureHotelExists(hotelId);

  await WishlistItem.findOneAndUpdate(
    { hotel: hotelId, user: userId },
    { hotel: hotelId, user: userId },
    { new: true, setDefaultsOnInsert: true, upsert: true },
  );

  return readWishlist(userId);
}

async function removeWishlistItem(userId, hotelId) {
  await WishlistItem.deleteOne({ hotel: hotelId, user: userId });
  return readWishlist(userId);
}

async function syncWishlist(userId, payload) {
  const hotelIds = Array.isArray(payload.hotelIds)
    ? payload.hotelIds.filter(Boolean)
    : [];

  if (hotelIds.length > 0) {
    const existingHotels = await Hotel.find({ _id: { $in: hotelIds } }).select('_id');
    const existingHotelIds = existingHotels.map(item => item._id.toString());

    await Promise.all(
      existingHotelIds.map(hotelId =>
        WishlistItem.findOneAndUpdate(
          { hotel: hotelId, user: userId },
          { hotel: hotelId, user: userId },
          { new: true, setDefaultsOnInsert: true, upsert: true },
        ),
      ),
    );
  }

  return readWishlist(userId);
}

module.exports = {
  addWishlistItem,
  getWishlist,
  readWishlist,
  removeWishlistItem,
  syncWishlist,
};
