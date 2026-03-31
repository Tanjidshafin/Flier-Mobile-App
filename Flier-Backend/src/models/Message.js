const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    body: { required: true, trim: true, type: String },
    conversation: {
      ref: 'Conversation',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    deliveredAt: { default: null, type: Date },
    seenAt: { default: null, type: Date },
    senderRole: {
      enum: ['user', 'admin', 'system'],
      required: true,
      type: String,
    },
    status: {
      default: 'sent',
      enum: ['sent', 'delivered', 'seen'],
      type: String,
    },
    user: {
      default: null,
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = {
  Message: mongoose.models.Message || mongoose.model('Message', messageSchema),
};
