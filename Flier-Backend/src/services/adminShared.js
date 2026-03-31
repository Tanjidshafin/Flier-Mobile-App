const { AppError } = require('../utils/AppError');

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePositiveInteger(value, fallback, { max } = {}) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  const rounded = Math.floor(parsed);
  return Number.isFinite(max) ? Math.min(rounded, max) : rounded;
}

function parsePagination(query, options = {}) {
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, options.defaultLimit || 10, {
    max: options.maxLimit || 25,
  });

  return {
    limit,
    page,
    skip: (page - 1) * limit,
  };
}

function buildPagination({ limit, page, total }) {
  return {
    limit,
    page,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

function parseEnum(value, allowedValues, fallback) {
  if (!value) {
    return fallback;
  }

  if (allowedValues.includes(value)) {
    return value;
  }

  throw new AppError(`Expected one of: ${allowedValues.join(', ')}.`, 400);
}

module.exports = {
  buildPagination,
  escapeRegex,
  parseEnum,
  parsePagination,
  parsePositiveInteger,
};
