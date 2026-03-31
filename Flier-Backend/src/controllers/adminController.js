const adminConversationService = require('../services/adminConversationService');
const adminDashboardService = require('../services/adminDashboardService');
const adminHotelService = require('../services/adminHotelService');
const adminNotificationService = require('../services/adminNotificationService');
const adminUserService = require('../services/adminUserService');

async function getDashboard(req, res) {
  const data = await adminDashboardService.getDashboardSummary();

  res.status(200).json({
    success: true,
    message: 'Admin dashboard fetched successfully.',
    data,
  });
}

async function listHotels(req, res) {
  const data = await adminHotelService.listAdminHotels(req.query);

  res.status(200).json({
    success: true,
    message: 'Admin hotels fetched successfully.',
    data,
  });
}

async function getHotel(req, res) {
  const data = await adminHotelService.getAdminHotelById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Admin hotel fetched successfully.',
    data,
  });
}

async function createHotel(req, res) {
  const data = await adminHotelService.createAdminHotel(req.body);

  res.status(201).json({
    success: true,
    message: 'Hotel created successfully.',
    data,
  });
}

async function updateHotel(req, res) {
  const data = await adminHotelService.updateAdminHotel(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Hotel updated successfully.',
    data,
  });
}

async function deleteHotel(req, res) {
  const data = await adminHotelService.archiveAdminHotel(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Hotel archived successfully.',
    data,
  });
}

async function listUsers(req, res) {
  const data = await adminUserService.listAdminUsers(req.query);

  res.status(200).json({
    success: true,
    message: 'Admin users fetched successfully.',
    data,
  });
}

async function updateUserRole(req, res) {
  const data = await adminUserService.updateUserRole(req.user, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'User role updated successfully.',
    data,
  });
}

async function updateUserStatus(req, res) {
  const data = await adminUserService.updateUserStatus(req.user, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'User status updated successfully.',
    data,
  });
}

async function listConversations(req, res) {
  const data = await adminConversationService.listAdminConversations(req.query);

  res.status(200).json({
    success: true,
    message: 'Admin conversations fetched successfully.',
    data,
  });
}

async function listMessages(req, res) {
  const data = await adminConversationService.listAdminMessages(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Admin conversation messages fetched successfully.',
    data,
  });
}

async function sendMessage(req, res) {
  const data = await adminConversationService.sendAdminMessage(
    req.user,
    req.params.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: 'Admin message sent successfully.',
    data,
  });
}

async function markConversationSeen(req, res) {
  const data = await adminConversationService.markAdminConversationSeen(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Admin conversation marked as seen.',
    data,
  });
}

async function listNotifications(req, res) {
  const data = await adminNotificationService.listAdminNotifications(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Admin notifications fetched successfully.',
    data,
  });
}

async function markNotificationRead(req, res) {
  const data = await adminNotificationService.markAdminNotificationRead(
    req.user._id,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    message: 'Admin notification marked as read.',
    data,
  });
}

async function deleteNotification(req, res) {
  const data = await adminNotificationService.deleteAdminNotification(
    req.user._id,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    message: 'Admin notification deleted successfully.',
    data,
  });
}

module.exports = {
  createHotel,
  deleteHotel,
  deleteNotification,
  getDashboard,
  getHotel,
  listConversations,
  listHotels,
  listMessages,
  listNotifications,
  listUsers,
  markConversationSeen,
  markNotificationRead,
  sendMessage,
  updateHotel,
  updateUserRole,
  updateUserStatus,
};
