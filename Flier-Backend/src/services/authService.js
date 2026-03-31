const bcrypt = require('bcryptjs');

const { User } = require('../models/User');
const { getEnvConfig } = require('../config/env');
const { createAdminNotifications } = require('./notificationService');
const { AppError } = require('../utils/AppError');
const { normalizeEmail } = require('../utils/normalizeEmail');
const { signAuthToken } = require('../utils/authToken');
const {
  validateLoginPayload,
  validateRegisterPayload,
} = require('../validators/authValidators');

function toAuthResponse(user) {
  return {
    token: signAuthToken(user._id.toString()),
    user: {
      avatar: {
        publicId: user.avatar?.publicId || null,
        url: user.avatar?.url || null,
      },
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      role: user.role || 'user',
      status: user.status || 'active',
      createdAt: user.createdAt,
    },
  };
}

async function syncBootstrapAdminRole(user) {
  if (!user) {
    return user;
  }

  const config = getEnvConfig();
  const shouldBeAdmin = config.adminBootstrapEmails.includes(normalizeEmail(user.email));

  if (shouldBeAdmin && user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
  }

  return user;
}

function assertUserIsActive(user) {
  if (user?.status === 'suspended') {
    throw new AppError('Your account has been suspended.', 403);
  }
}

async function registerUser(payload) {
  const validatedPayload = validateRegisterPayload(payload);
  const email = normalizeEmail(validatedPayload.email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('An account with that email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(validatedPayload.password, 12);
  const user = await User.create({
    email,
    fullName: validatedPayload.fullName,
    passwordHash,
  });
  await syncBootstrapAdminRole(user);

  await createAdminNotifications({
    body: `${user.fullName} just created an account.`,
    data: {
      routeName: 'AdminUsers',
    },
    title: 'New user registered',
    type: 'system_alert',
  });

  return toAuthResponse(user);
}

async function loginUser(payload) {
  const validatedPayload = validateLoginPayload(payload);
  const user = await User.findOne({ email: normalizeEmail(validatedPayload.email) });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  await syncBootstrapAdminRole(user);
  assertUserIsActive(user);

  const passwordMatches = await bcrypt.compare(
    validatedPayload.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  return toAuthResponse(user);
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  await syncBootstrapAdminRole(user);
  assertUserIsActive(user);

  return toAuthResponse(user);
}

module.exports = {
  getCurrentUser,
  loginUser,
  registerUser,
  syncBootstrapAdminRole,
  toAuthResponse,
};
