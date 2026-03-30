const express = require('express');

const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const destinationRoutes = require('./destinationRoutes');
const homeRoutes = require('./homeRoutes');
const hotelRoutes = require('./hotelRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const { getHealthStatus } = require('../controllers/healthController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/health', asyncHandler(getHealthStatus));
router.use('/auth', authRoutes);
router.use('/home', homeRoutes);
router.use('/destinations', destinationRoutes);
router.use('/hotels', hotelRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
