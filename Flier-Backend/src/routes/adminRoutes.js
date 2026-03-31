const express = require('express');

const adminController = require('../controllers/adminController');
const { authenticateRequest, requireAdmin } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest, requireAdmin);

router.get('/dashboard', asyncHandler(adminController.getDashboard));

router.get('/hotels', asyncHandler(adminController.listHotels));
router.get('/hotels/:id', asyncHandler(adminController.getHotel));
router.post('/hotels', asyncHandler(adminController.createHotel));
router.patch('/hotels/:id', asyncHandler(adminController.updateHotel));
router.delete('/hotels/:id', asyncHandler(adminController.deleteHotel));

router.get('/users', asyncHandler(adminController.listUsers));
router.patch('/users/:id/role', asyncHandler(adminController.updateUserRole));
router.patch('/users/:id/status', asyncHandler(adminController.updateUserStatus));

router.get('/conversations', asyncHandler(adminController.listConversations));
router.get('/conversations/:id/messages', asyncHandler(adminController.listMessages));
router.post('/conversations/:id/messages', asyncHandler(adminController.sendMessage));
router.post('/conversations/:id/seen', asyncHandler(adminController.markConversationSeen));

router.get('/notifications', asyncHandler(adminController.listNotifications));
router.patch('/notifications/:id/read', asyncHandler(adminController.markNotificationRead));
router.delete('/notifications/:id', asyncHandler(adminController.deleteNotification));

module.exports = router;
