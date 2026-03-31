const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const { normalizeEmail } = require('../utils/normalizeEmail');
const { normalizePhoneNumber } = require('../utils/normalizePhoneNumber');

function mapUserProfile(user) {
  return {
    avatar: {
      publicId: user.avatar?.publicId || null,
      url: user.avatar?.url || null,
    },
    createdAt: user.createdAt,
    email: user.email,
    fullName: user.fullName,
    id: user._id.toString(),
    phoneNumber: user.phoneNumber || null,
    role: user.role || 'user',
    status: user.status || 'active',
    suspendedAt: user.suspendedAt || null,
    suspensionReason: user.suspensionReason || null,
  };
}

async function updateProfile(userId, payload) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const fullName = String(payload.fullName || user.fullName || '').trim();
  const email = normalizeEmail(payload.email || user.email || '');
  const phoneNumber = payload.phoneNumber
    ? normalizePhoneNumber(payload.phoneNumber)
    : payload.phoneNumber === ''
      ? null
      : user.phoneNumber;
  const avatarUrl = payload.avatarUrl ? String(payload.avatarUrl).trim() : null;
  const avatarPublicId = payload.avatarPublicId
    ? String(payload.avatarPublicId).trim()
    : null;

  if (!fullName) {
    throw new AppError('Full name is required.', 400);
  }

  if (!email) {
    throw new AppError('Email is required.', 400);
  }

  const existingUser = await User.findOne({ _id: { $ne: userId }, email });

  if (existingUser) {
    throw new AppError('An account with that email already exists.', 409);
  }

  user.fullName = fullName;
  user.email = email;
  user.phoneNumber = phoneNumber || null;

  if (avatarUrl !== null || avatarPublicId !== null) {
    user.avatar = {
      publicId: avatarPublicId,
      url: avatarUrl,
    };
  }

  await user.save();

  return mapUserProfile(user);
}

module.exports = {
  mapUserProfile,
  updateProfile,
};
