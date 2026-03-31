const { Hotel } = require('../models/Hotel');
const { AppError } = require('../utils/AppError');
const {
  buildPagination,
  escapeRegex,
  parseEnum,
  parsePagination,
} = require('./adminShared');

function normalizeString(value, fieldName) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    throw new AppError(`${fieldName} is required.`, 400);
  }

  return normalized;
}

function normalizeOptionalString(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function normalizeNumber(value, fieldName, { min, max } = {}) {
  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new AppError(`${fieldName} must be a valid number.`, 400);
  }

  if (Number.isFinite(min) && normalized < min) {
    throw new AppError(`${fieldName} must be at least ${min}.`, 400);
  }

  if (Number.isFinite(max) && normalized > max) {
    throw new AppError(`${fieldName} must be no greater than ${max}.`, 400);
  }

  return normalized;
}

function normalizeStringArray(values, fieldName) {
  if (!Array.isArray(values)) {
    throw new AppError(`${fieldName} must be an array.`, 400);
  }

  return values.map(value => String(value || '').trim()).filter(Boolean);
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapAdminHotel(hotel) {
  return {
    amenities: hotel.amenities || [],
    availableRooms: hotel.availableRooms,
    baths: hotel.baths,
    cancellationWindowHours: hotel.cancellationWindowHours || 48,
    createdAt: hotel.createdAt,
    description: hotel.description,
    featured: Boolean(hotel.featured),
    featuredDestination: Boolean(hotel.featuredDestination),
    id: hotel._id.toString(),
    images: hotel.images || [],
    location: hotel.location,
    maxGuests: hotel.maxGuests,
    name: hotel.name,
    policies: {
      cancellation: hotel.policies?.cancellation || '',
      checkInFrom: hotel.policies?.checkInFrom || '',
      checkOutUntil: hotel.policies?.checkOutUntil || '',
      houseRules: hotel.policies?.houseRules || [],
    },
    pricing: hotel.pricing,
    rating: hotel.rating,
    recentReviews: hotel.recentReviews || [],
    reviewCount: hotel.reviewCount,
    reviewsSummary: hotel.reviewsSummary || {
      categories: {
        cleanliness: null,
        location: null,
        service: null,
        value: null,
      },
      total: 0,
    },
    roomTypes: hotel.roomTypes || [],
    rooms: hotel.rooms,
    shortDescription: hotel.shortDescription,
    slug: hotel.slug,
    squareMeters: hotel.squareMeters,
    status: hotel.status || 'active',
    tag: hotel.tag || null,
    updatedAt: hotel.updatedAt,
  };
}

function mergeHotelPayload(existingHotel, payload) {
  const existing = existingHotel ? mapAdminHotel(existingHotel) : null;

  return {
    ...existing,
    ...payload,
    location: {
      ...(existing?.location || {}),
      ...(payload.location || {}),
    },
    policies: {
      ...(existing?.policies || {}),
      ...(payload.policies || {}),
    },
    pricing: {
      ...(existing?.pricing || {}),
      ...(payload.pricing || {}),
    },
    reviewsSummary: {
      ...(existing?.reviewsSummary || {}),
      ...(payload.reviewsSummary || {}),
      categories: {
        ...(existing?.reviewsSummary?.categories || {}),
        ...(payload.reviewsSummary?.categories || {}),
      },
    },
  };
}

function normalizeRoomTypes(roomTypes, fallbackImage) {
  if (!Array.isArray(roomTypes)) {
    return [];
  }

  return roomTypes.map((roomType, index) => {
    const image =
      normalizeOptionalString(roomType.image) || fallbackImage || null;

    if (!image) {
      throw new AppError(`roomTypes[${index}].image is required.`, 400);
    }

    return {
      amenities: normalizeStringArray(
        roomType.amenities || [],
        `roomTypes[${index}].amenities`,
      ),
      availableUnits: normalizeNumber(
        roomType.availableUnits,
        `roomTypes[${index}].availableUnits`,
        { min: 1 },
      ),
      beds: normalizeNumber(roomType.beds, `roomTypes[${index}].beds`, { min: 1 }),
      code: normalizeString(roomType.code, `roomTypes[${index}].code`),
      description: normalizeString(
        roomType.description,
        `roomTypes[${index}].description`,
      ),
      image,
      maxGuests: normalizeNumber(roomType.maxGuests, `roomTypes[${index}].maxGuests`, {
        min: 1,
      }),
      name: normalizeString(roomType.name, `roomTypes[${index}].name`),
      nightlyRate: normalizeNumber(
        roomType.nightlyRate,
        `roomTypes[${index}].nightlyRate`,
        { min: 1 },
      ),
    };
  });
}

function normalizeHotelPayload(payload, existingHotel = null) {
  const merged = mergeHotelPayload(existingHotel, payload);
  const images = normalizeStringArray(merged.images || [], 'images');
  const slug = slugify(merged.slug || merged.name);

  if (images.length === 0) {
    throw new AppError('At least one hotel image is required.', 400);
  }

  if (!slug) {
    throw new AppError('Slug is required.', 400);
  }

  return {
    amenities: normalizeStringArray(merged.amenities || [], 'amenities'),
    availableRooms: normalizeNumber(merged.availableRooms, 'Available rooms', { min: 1 }),
    baths: normalizeNumber(merged.baths, 'Baths', { min: 1 }),
    cancellationWindowHours: normalizeNumber(
      merged.cancellationWindowHours ?? 48,
      'Cancellation window hours',
      { min: 0 },
    ),
    description: normalizeString(merged.description, 'Description'),
    featured: Boolean(merged.featured),
    featuredDestination: Boolean(merged.featuredDestination),
    images,
    location: {
      address: normalizeString(merged.location?.address, 'Address'),
      area: normalizeString(merged.location?.area, 'Area'),
      city: normalizeString(merged.location?.city, 'City'),
      country: normalizeString(merged.location?.country, 'Country'),
      destinationId: normalizeString(merged.location?.destinationId, 'Destination id'),
    },
    maxGuests: normalizeNumber(merged.maxGuests, 'Max guests', { min: 1 }),
    name: normalizeString(merged.name, 'Name'),
    policies: {
      cancellation: normalizeString(
        merged.policies?.cancellation,
        'Cancellation policy',
      ),
      checkInFrom: normalizeString(merged.policies?.checkInFrom, 'Check-in from'),
      checkOutUntil: normalizeString(
        merged.policies?.checkOutUntil,
        'Check-out until',
      ),
      houseRules: normalizeStringArray(
        merged.policies?.houseRules || [],
        'House rules',
      ),
    },
    pricing: {
      cleaningFee: normalizeNumber(merged.pricing?.cleaningFee ?? 0, 'Cleaning fee', {
        min: 0,
      }),
      currency: normalizeString(merged.pricing?.currency || 'USD', 'Currency'),
      nightlyRate: normalizeNumber(merged.pricing?.nightlyRate, 'Nightly rate', {
        min: 1,
      }),
      serviceFee: normalizeNumber(merged.pricing?.serviceFee ?? 0, 'Service fee', {
        min: 0,
      }),
      taxRate: normalizeNumber(merged.pricing?.taxRate ?? 0.1, 'Tax rate', {
        min: 0,
      }),
    },
    rating: normalizeNumber(merged.rating, 'Rating', { min: 0, max: 5 }),
    recentReviews: Array.isArray(merged.recentReviews) ? merged.recentReviews : [],
    reviewCount: normalizeNumber(merged.reviewCount, 'Review count', { min: 0 }),
    reviewsSummary: {
      categories: {
        cleanliness:
          merged.reviewsSummary?.categories?.cleanliness == null
            ? null
            : normalizeNumber(
                merged.reviewsSummary.categories.cleanliness,
                'Cleanliness rating',
                { min: 0, max: 5 },
              ),
        location:
          merged.reviewsSummary?.categories?.location == null
            ? null
            : normalizeNumber(
                merged.reviewsSummary.categories.location,
                'Location rating',
                { min: 0, max: 5 },
              ),
        service:
          merged.reviewsSummary?.categories?.service == null
            ? null
            : normalizeNumber(
                merged.reviewsSummary.categories.service,
                'Service rating',
                { min: 0, max: 5 },
              ),
        value:
          merged.reviewsSummary?.categories?.value == null
            ? null
            : normalizeNumber(merged.reviewsSummary.categories.value, 'Value rating', {
                min: 0,
                max: 5,
              }),
      },
      total: normalizeNumber(
        merged.reviewsSummary?.total ?? merged.reviewCount,
        'Review total',
        { min: 0 },
      ),
    },
    roomTypes: normalizeRoomTypes(merged.roomTypes || [], images[0] || null),
    rooms: normalizeNumber(merged.rooms, 'Rooms', { min: 1 }),
    shortDescription: normalizeString(merged.shortDescription, 'Short description'),
    slug,
    squareMeters: normalizeNumber(merged.squareMeters, 'Square meters', { min: 10 }),
    status: parseEnum(merged.status || 'active', ['active', 'archived'], 'active'),
    tag: normalizeOptionalString(merged.tag),
  };
}

async function ensureUniqueSlug(slug, hotelId = null) {
  const filters = { slug };

  if (hotelId) {
    filters._id = { $ne: hotelId };
  }

  const existingHotel = await Hotel.findOne(filters);

  if (existingHotel) {
    throw new AppError('Another hotel already uses that slug.', 409);
  }
}

async function listAdminHotels(query) {
  const { limit, page, skip } = parsePagination(query, {
    defaultLimit: 10,
    maxLimit: 30,
  });
  const requestedStatus = String(query.status || 'active').trim();
  const statusFilter =
    requestedStatus === 'all'
      ? null
      : parseEnum(requestedStatus, ['active', 'archived'], 'active');
  const search = String(query.search || '').trim();
  const filters = {};

  if (statusFilter) {
    filters.status = statusFilter;
  }

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: 'i' };
    filters.$or = [
      { name: regex },
      { slug: regex },
      { 'location.area': regex },
      { 'location.city': regex },
      { 'location.country': regex },
    ];
  }

  const [hotels, total] = await Promise.all([
    Hotel.find(filters).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Hotel.countDocuments(filters),
  ]);

  return {
    items: hotels.map(mapAdminHotel),
    pagination: buildPagination({ limit, page, total }),
  };
}

async function getAdminHotelById(hotelId) {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  return mapAdminHotel(hotel);
}

async function createAdminHotel(payload) {
  const normalizedPayload = normalizeHotelPayload(payload);
  await ensureUniqueSlug(normalizedPayload.slug);
  const hotel = await Hotel.create(normalizedPayload);
  return mapAdminHotel(hotel);
}

async function updateAdminHotel(hotelId, payload) {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  const normalizedPayload = normalizeHotelPayload(payload, hotel);
  await ensureUniqueSlug(normalizedPayload.slug, hotelId);
  Object.assign(hotel, normalizedPayload);
  await hotel.save();

  return mapAdminHotel(hotel);
}

async function archiveAdminHotel(hotelId) {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  hotel.status = 'archived';
  await hotel.save();

  return {
    id: hotel._id.toString(),
    status: hotel.status,
  };
}

module.exports = {
  archiveAdminHotel,
  createAdminHotel,
  getAdminHotelById,
  listAdminHotels,
  mapAdminHotel,
  normalizeHotelPayload,
  updateAdminHotel,
};
