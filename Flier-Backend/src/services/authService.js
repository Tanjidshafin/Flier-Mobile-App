const bcrypt = require('bcryptjs');

const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const { signAuthToken } = require('../utils/authToken');
const {
  validateLoginPayload,
  validateRegisterPayload,
} = require('../validators/authValidators');

function toAuthResponse(user) {
  return {
    token: signAuthToken(user._id.toString()),
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      createdAt: user.createdAt,
    },
  };
}

async function registerUser(payload) {
  const validatedPayload = validateRegisterPayload(payload);
  const existingUser = await User.findOne({ email: validatedPayload.email });

  if (existingUser) {
    throw new AppError('An account with that email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(validatedPayload.password, 12);
  const user = await User.create({
    email: validatedPayload.email,
    fullName: validatedPayload.fullName,
    passwordHash,
  });

  return toAuthResponse(user);
}

async function loginUser(payload) {
  const validatedPayload = validateLoginPayload(payload);
  const user = await User.findOne({ email: validatedPayload.email });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

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

  return toAuthResponse(user);
}

module.exports = {
  getCurrentUser,
  loginUser,
  registerUser,
  toAuthResponse,
};
