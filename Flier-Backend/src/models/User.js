const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
};
