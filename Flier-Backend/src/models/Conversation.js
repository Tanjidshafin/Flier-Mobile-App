const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    hotel: {
      ref: 'Hotel',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    hotelSnapshot: {
      coverImage: { default: null, trim: true, type: String },
      locationLabel: { required: true, trim: true, type: String },
      name: { required: true, trim: true, type: String },
      slug: { required: true, trim: true, type: String },
    },
    adminUnreadCount: { default: 0, min: 0, type: Number },
    lastMessageAt: { default: Date.now, type: Date },
    lastMessagePreview: { default: '', trim: true, type: String },
    subject: { default: '', trim: true, type: String },
    userUnreadCount: { default: 0, min: 0, type: Number },
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

conversationSchema.index({ hotel: 1, user: 1 }, { unique: true });

module.exports = {
  Conversation:
    mongoose.models.Conversation ||
    mongoose.model('Conversation', conversationSchema),
};
