const express = require('express');

const {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
  syncWishlist,
} = require('../controllers/wishlistController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.get('/', asyncHandler(getWishlist));
router.post('/sync', asyncHandler(syncWishlist));
router.post('/:hotelId', asyncHandler(addWishlistItem));
router.delete('/:hotelId', asyncHandler(removeWishlistItem));

module.exports = router;
