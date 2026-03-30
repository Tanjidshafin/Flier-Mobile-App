const wishlistService = require('../services/wishlistService');

async function getWishlist(req, res) {
  const data = await wishlistService.getWishlist(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Wishlist fetched successfully.',
    data,
  });
}

async function addWishlistItem(req, res) {
  const data = await wishlistService.addWishlistItem(req.user._id, req.params.hotelId);

  res.status(200).json({
    success: true,
    message: 'Hotel saved to wishlist.',
    data,
  });
}

async function removeWishlistItem(req, res) {
  const data = await wishlistService.removeWishlistItem(
    req.user._id,
    req.params.hotelId,
  );

  res.status(200).json({
    success: true,
    message: 'Hotel removed from wishlist.',
    data,
  });
}

async function syncWishlist(req, res) {
  const data = await wishlistService.syncWishlist(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Wishlist synced successfully.',
    data,
  });
}

module.exports = {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
  syncWishlist,
};
