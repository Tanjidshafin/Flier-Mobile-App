const express = require('express');

const {
  deleteNotification,
  listNotifications,
  markNotificationRead,
} = require('../controllers/notificationController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.get('/', asyncHandler(listNotifications));
router.patch('/:id/read', asyncHandler(markNotificationRead));
router.delete('/:id', asyncHandler(deleteNotification));

module.exports = router;
