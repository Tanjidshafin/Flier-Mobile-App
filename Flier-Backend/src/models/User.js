const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    avatar: {
      publicId: {
        default: null,
        trim: true,
        type: String,
      },
      url: {
        default: null,
        trim: true,
        type: String,
      },
    },
    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
      unique: true,
    },
    fullName: {
      required: true,
      trim: true,
      type: String,
    },
    passwordHash: {
      required: true,
      type: String,
    },
    phoneNumber: {
      default: null,
      trim: true,
      type: String,
    },
    role: {
      default: 'user',
      enum: ['user', 'admin'],
      type: String,
    },
    stripeCustomerId: {
      default: null,
      trim: true,
      type: String,
    },
    status: {
      default: 'active',
      enum: ['active', 'suspended'],
      type: String,
    },
    suspendedAt: {
      default: null,
      type: Date,
    },
    suspensionReason: {
      default: null,
      trim: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
};
