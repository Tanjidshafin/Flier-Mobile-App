const { AppError } = require('../utils/AppError');
const { normalizePhoneNumber } = require('../utils/normalizePhoneNumber');

function validateRegisterPayload(body) {
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!fullName || !email || !password) {
    throw new AppError('Full name, email, and password are required.', 400);
  }

  if (fullName.length < 2) {
    throw new AppError('Full name must be at least 2 characters.', 400);
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new AppError('A valid email is required.', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters.', 400);
  }

  return {
    email,
    fullName,
    password,
  };
}

function validateLoginPayload(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new AppError('A valid email is required.', 400);
  }

  return {
    email,
    password,
  };
}

function validateOptionalPhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    return null;
  }

  return normalizePhoneNumber(phoneNumber);
}

module.exports = {
  validateLoginPayload,
  validateOptionalPhoneNumber,
  validateRegisterPayload,
};
