const {
  deleteNotification,
  listNotifications,
  markNotificationRead,
} = require('./notificationService');

async function listAdminNotifications(userId) {
  return listNotifications(userId, 'admin');
}

async function markAdminNotificationRead(userId, notificationId) {
  return markNotificationRead(userId, notificationId, 'admin');
}

async function deleteAdminNotification(userId, notificationId) {
  return deleteNotification(userId, notificationId, 'admin');
}

module.exports = {
  deleteAdminNotification,
  listAdminNotifications,
  markAdminNotificationRead,
};
