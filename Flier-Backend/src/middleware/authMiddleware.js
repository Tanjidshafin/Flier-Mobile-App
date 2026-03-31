const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const { verifyAuthToken } = require('../utils/authToken');

async function authenticateRequest(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError('Authorization token is required.', 401);
    }

    const token = authorization.replace('Bearer ', '');
    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError('Invalid authentication token.', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new AppError('Authentication is required.', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access is required.', 403));
  }

  return next();
}

module.exports = { authenticateRequest, requireAdmin };
