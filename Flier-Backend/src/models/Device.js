const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    lastSeenAt: { default: Date.now, type: Date },
    platform: { default: 'unknown', trim: true, type: String },
    token: { required: true, trim: true, type: String, unique: true },
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
  Device: mongoose.models.Device || mongoose.model('Device', deviceSchema),
};
