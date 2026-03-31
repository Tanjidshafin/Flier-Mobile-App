const notificationService = require('../services/notificationService');

async function listNotifications(req, res) {
  const data = await notificationService.listNotifications(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Notifications fetched successfully.',
    data,
  });
}

async function markNotificationRead(req, res) {
  const data = await notificationService.markNotificationRead(
    req.user._id,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    message: 'Notification marked as read.',
    data,
  });
}

async function deleteNotification(req, res) {
  const data = await notificationService.deleteNotification(
    req.user._id,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully.',
    data,
  });
}

module.exports = {
  deleteNotification,
  listNotifications,
  markNotificationRead,
};
