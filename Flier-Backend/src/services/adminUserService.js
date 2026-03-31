const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const {
  buildPagination,
  escapeRegex,
  parseEnum,
  parsePagination,
} = require('./adminShared');

function mapAdminUser(user) {
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

async function ensureNotLastActiveAdmin(user, nextRole, nextStatus) {
  const isCurrentlyActiveAdmin = user.role === 'admin' && user.status === 'active';
  const willRemainActiveAdmin = nextRole === 'admin' && nextStatus === 'active';

  if (!isCurrentlyActiveAdmin || willRemainActiveAdmin) {
    return;
  }

  const remainingActiveAdmins = await User.countDocuments({
    _id: { $ne: user._id },
    role: 'admin',
    status: 'active',
  });

  if (remainingActiveAdmins === 0) {
    throw new AppError('At least one active admin account must remain.', 409);
  }
}

async function listAdminUsers(query) {
  const { limit, page, skip } = parsePagination(query, {
    defaultLimit: 12,
    maxLimit: 40,
  });
  const requestedRole = String(query.role || 'all').trim();
  const requestedStatus = String(query.status || 'all').trim();
  const role = requestedRole === 'all' ? null : parseEnum(requestedRole, ['user', 'admin']);
  const status =
    requestedStatus === 'all'
      ? null
      : parseEnum(requestedStatus, ['active', 'suspended']);
  const search = String(query.search || '').trim();
  const filters = {};

  if (role) {
    filters.role = role;
  }

  if (status) {
    filters.status = status;
  }

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: 'i' };
    filters.$or = [{ fullName: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filters),
  ]);

  return {
    items: users.map(mapAdminUser),
    pagination: buildPagination({ limit, page, total }),
  };
}

async function updateUserRole(actor, userId, payload) {
  const nextRole = parseEnum(payload.role, ['user', 'admin']);
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (actor._id.toString() === user._id.toString() && nextRole !== 'admin') {
    throw new AppError('You cannot remove your own admin access.', 409);
  }

  await ensureNotLastActiveAdmin(user, nextRole, user.status || 'active');
  user.role = nextRole;
  await user.save();

  return mapAdminUser(user);
}

async function updateUserStatus(actor, userId, payload) {
  const nextStatus = parseEnum(payload.status, ['active', 'suspended']);
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (actor._id.toString() === user._id.toString() && nextStatus === 'suspended') {
    throw new AppError('You cannot suspend your own account.', 409);
  }

  await ensureNotLastActiveAdmin(user, user.role || 'user', nextStatus);
  user.status = nextStatus;

  if (nextStatus === 'suspended') {
    user.suspendedAt = new Date();
    user.suspensionReason = String(payload.reason || '').trim() || 'Suspended by admin';
  } else {
    user.suspendedAt = null;
    user.suspensionReason = null;
  }

  await user.save();

  return mapAdminUser(user);
}

module.exports = {
  listAdminUsers,
  mapAdminUser,
  updateUserRole,
  updateUserStatus,
};
