const express = require('express');

const adminRoutes = require('./adminRoutes');
const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const conversationRoutes = require('./conversationRoutes');
const deviceRoutes = require('./deviceRoutes');
const destinationRoutes = require('./destinationRoutes');
const homeRoutes = require('./homeRoutes');
const hotelRoutes = require('./hotelRoutes');
const notificationRoutes = require('./notificationRoutes');
const paymentRoutes = require('./paymentRoutes');
const uploadRoutes = require('./uploadRoutes');
const userRoutes = require('./userRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const { getHealthStatus } = require('../controllers/healthController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/health', asyncHandler(getHealthStatus));
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/home', homeRoutes);
router.use('/destinations', destinationRoutes);
router.use('/hotels', hotelRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/devices', deviceRoutes);
router.use('/conversations', conversationRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
