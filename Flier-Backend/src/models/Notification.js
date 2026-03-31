const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    body: { required: true, trim: true, type: String },
    data: {
      bookingId: { default: null, trim: true, type: String },
      conversationId: { default: null, trim: true, type: String },
      hotelSlug: { default: null, trim: true, type: String },
      routeName: { default: null, trim: true, type: String },
    },
    deletedAt: { default: null, type: Date },
    readAt: { default: null, type: Date },
    scope: {
      default: 'user',
      enum: ['user', 'admin'],
      type: String,
    },
    title: { required: true, trim: true, type: String },
    type: {
      enum: ['booking_update', 'chat_message', 'system_alert'],
      required: true,
      type: String,
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = {
  Notification:
    mongoose.models.Notification ||
    mongoose.model('Notification', notificationSchema),
};
