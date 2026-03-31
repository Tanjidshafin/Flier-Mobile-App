const { Notification } = require('../models/Notification');
const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const { emitToUser } = require('./realtimeHub');

function mapNotification(notification) {
  return {
    body: notification.body,
    createdAt: notification.createdAt,
    data: notification.data,
    id: notification._id.toString(),
    isRead: Boolean(notification.readAt),
    readAt: notification.readAt,
    scope: notification.scope || 'user',
    title: notification.title,
    type: notification.type,
  };
}

async function createNotification({
  body,
  data = {},
  scope = 'user',
  title,
  type,
  userId,
}) {
  const notification = await Notification.create({
    body,
    data,
    scope,
    title,
    type,
    user: userId,
  });

  const payload = mapNotification(notification);
  emitToUser(userId.toString(), 'notification:new', payload);

  return payload;
}

async function createAdminNotifications({ body, data = {}, title, type }) {
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');

  if (admins.length === 0) {
    return [];
  }

  return Promise.all(
    admins.map(admin =>
      createNotification({
        body,
        data,
        scope: 'admin',
        title,
        type,
        userId: admin._id,
      }),
    ),
  );
}

async function listNotifications(userId, scope = 'user') {
  const notifications = await Notification.find({
    deletedAt: null,
    scope,
    user: userId,
  }).sort({ createdAt: -1 });

  return notifications.map(mapNotification);
}

async function markNotificationRead(userId, notificationId, scope = 'user') {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, deletedAt: null, scope, user: userId },
    { readAt: new Date() },
    { new: true },
  );

  if (!notification) {
    throw new AppError('Notification not found.', 404);
  }

  return mapNotification(notification);
}

async function deleteNotification(userId, notificationId, scope = 'user') {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, deletedAt: null, scope, user: userId },
    { deletedAt: new Date() },
    { new: true },
  );

  if (!notification) {
    throw new AppError('Notification not found.', 404);
  }

  return {
    id: notification._id.toString(),
  };
}

module.exports = {
  createAdminNotifications,
  createNotification,
  deleteNotification,
  listNotifications,
  mapNotification,
  markNotificationRead,
};
