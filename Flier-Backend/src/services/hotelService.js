const { Hotel } = require('../models/Hotel');
const { Booking } = require('../models/Booking');
const { AppError } = require('../utils/AppError');

function buildLocationLabel(location) {
  return `${location.area}, ${location.city}, ${location.country}`;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenizeSearchInput(value) {
  return String(value || '')
    .split(/[,\s]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function parseCursor(cursor) {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(String(cursor), 'base64url').toString('utf8'));
    const offset = Number(decoded.offset);
    return Number.isInteger(offset) && offset >= 0 ? offset : null;
  } catch {
    throw new AppError('Cursor is invalid.', 400);
  }
}

function buildCursor(offset) {
  return Buffer.from(JSON.stringify({ offset }), 'utf8').toString('base64url');
}

function buildDefaultRoomTypes(hotel) {
  return [
    {
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 5) : [],
      availableUnits: hotel.availableRooms,
      beds: Math.max(hotel.rooms || 1, 1),
      code: 'signature-suite',
      description: hotel.shortDescription,
      image: hotel.images?.[0] || null,
      maxGuests: hotel.maxGuests,
      name: hotel.tag ? `${hotel.tag} Room` : 'Signature Room',
      nightlyRate: hotel.pricing.nightlyRate,
    },
  ];
}

function getRoomTypes(hotel) {
  return hotel.roomTypes?.length ? hotel.roomTypes : buildDefaultRoomTypes(hotel);
}

function getReviewsSummary(hotel) {
  const existing = hotel.reviewsSummary || {};
  return {
    average: hotel.rating,
    categories: {
      cleanliness: existing.categories?.cleanliness ?? hotel.rating,
      location: existing.categories?.location ?? hotel.rating,
      service: existing.categories?.service ?? hotel.rating,
      value: existing.categories?.value ?? Math.max(hotel.rating - 0.1, 0),
    },
    total: existing.total || hotel.reviewCount,
  };
}

function getRecentReviews(hotel) {
  if (hotel.recentReviews?.length) {
    return hotel.recentReviews.map((review, index) => ({
      authorAvatar: review.authorAvatar || null,
      authorName: review.authorName,
      comment: review.comment,
      createdAt: review.createdAt,
      id: `${hotel._id.toString()}-review-${index + 1}`,
      rating: review.rating,
    }));
  }

  return [
    {
      authorAvatar: null,
      authorName: 'Nadia R.',
      comment: 'The staff was responsive, the room felt polished, and check-in was seamless.',
      createdAt: new Date('2026-02-08T00:00:00.000Z'),
      id: `${hotel._id.toString()}-review-1`,
      rating: Math.max(hotel.rating - 0.1, 1),
    },
    {
      authorAvatar: null,
      authorName: 'Marcus T.',
      comment: 'Great location and a strong value for the nightly rate.',
      createdAt: new Date('2026-01-21T00:00:00.000Z'),
      id: `${hotel._id.toString()}-review-2`,
      rating: Math.max(hotel.rating - 0.2, 1),
    },
  ];
}

function mapHotelCard(hotel) {
  return {
    amenities: hotel.amenities,
    baths: hotel.baths,
    featured: hotel.featured,
    id: hotel._id.toString(),
    image: hotel.images[0],
    location: hotel.location,
    locationLabel: buildLocationLabel(hotel.location),
    maxGuests: hotel.maxGuests,
    name: hotel.name,
    price: {
      amount: hotel.pricing.nightlyRate,
      currency: hotel.pricing.currency,
    },
    rating: hotel.rating,
    reviewCount: hotel.reviewCount,
    rooms: hotel.rooms,
    shortDescription: hotel.shortDescription,
    slug: hotel.slug,
    squareMeters: hotel.squareMeters,
    tag: hotel.tag,
  };
}

function mapHotelDetails(hotel, availability) {
  const roomTypes = getRoomTypes(hotel).map(roomType => {
    const roomAvailability = availability.byRoomType[roomType.code] || {
      availableUnits: roomType.availableUnits,
      reservedUnits: 0,
    };

    return {
      amenities: roomType.amenities,
      availableUnits: roomAvailability.availableUnits,
      beds: roomType.beds,
      code: roomType.code,
      description: roomType.description,
      image: roomType.image,
      maxGuests: roomType.maxGuests,
      name: roomType.name,
      nightlyRate: roomType.nightlyRate,
      reservedUnits: roomAvailability.reservedUnits,
    };
  });

  return {
    ...mapHotelCard(hotel),
    availableRooms: hotel.availableRooms,
    availability,
    cancellationWindowHours: hotel.cancellationWindowHours || 48,
    description: hotel.description,
    images: hotel.images,
    policies: hotel.policies,
    pricing: hotel.pricing,
    recentReviews: getRecentReviews(hotel),
    reviewsSummary: getReviewsSummary(hotel),
    roomTypes,
  };
}

function parsePositiveNumber(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseDateRange(checkIn, checkOut) {
  if (!checkIn && !checkOut) {
    return null;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new AppError('A valid check-in and check-out date range is required.', 400);
  }

  if (checkOutDate <= checkInDate) {
    throw new AppError('Check-out must be after check-in.', 400);
  }

  return {
    checkInDate,
    checkOutDate,
  };
}

async function expirePendingBookings() {
  await Booking.updateMany(
    {
      holdExpiresAt: { $lte: new Date() },
      status: 'pending_payment',
    },
    {
      paymentStatus: 'failed',
      status: 'expired',
    },
  );
}

async function getAvailabilityForHotel(hotel, dateRange) {
  const roomTypes = getRoomTypes(hotel);
  const result = {
    byRoomType: {},
    hasAvailability: true,
    totalAvailableRooms: hotel.availableRooms,
  };

  for (const roomType of roomTypes) {
    result.byRoomType[roomType.code] = {
      availableUnits: roomType.availableUnits,
      reservedUnits: 0,
    };
  }

  if (!dateRange) {
    return result;
  }

  await expirePendingBookings();

  const activeBookings = await Booking.find({
    checkIn: { $lt: dateRange.checkOutDate },
    checkOut: { $gt: dateRange.checkInDate },
    hotel: hotel._id,
    status: { $in: ['pending_payment', 'confirmed'] },
    $or: [
      { status: 'confirmed' },
      { holdExpiresAt: { $gt: new Date() } },
    ],
  });

  let totalReservedRooms = 0;

  for (const booking of activeBookings) {
    const roomTypeId = booking.roomTypeId || 'signature-suite';
    const current = result.byRoomType[roomTypeId] || {
      availableUnits: 0,
      reservedUnits: 0,
    };
    current.reservedUnits += booking.roomCount || booking.guests?.rooms || 1;
    current.availableUnits = Math.max(current.availableUnits - (booking.roomCount || 1), 0);
    result.byRoomType[roomTypeId] = current;
    totalReservedRooms += booking.roomCount || booking.guests?.rooms || 1;
  }

  result.totalAvailableRooms = Math.max(hotel.availableRooms - totalReservedRooms, 0);
  result.hasAvailability = Object.values(result.byRoomType).some(
    item => item.availableUnits > 0,
  );

  return result;
}

function buildSearchConditions(searchText) {
  const tokens = tokenizeSearchInput(searchText);

  if (tokens.length === 0) {
    return [];
  }

  return tokens.map(token => {
    const regex = { $regex: escapeRegex(token), $options: 'i' };
    return {
      $or: [
        { name: regex },
        { 'location.area': regex },
        { 'location.city': regex },
        { 'location.country': regex },
        { shortDescription: regex },
      ],
    };
  });
}

async function getHomeContent() {
  const featuredHotels = await Hotel.find({ featured: true, status: 'active' })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(8);

  const featuredDestinationsAggregation = await Hotel.aggregate([
    { $match: { featuredDestination: true, status: 'active' } },
    {
      $group: {
        _id: '$location.destinationId',
        city: { $first: '$location.city' },
        country: { $first: '$location.country' },
        image: { $first: { $arrayElemAt: ['$images', 0] } },
        stays: { $sum: 1 },
      },
    },
    { $sort: { stays: -1, city: 1 } },
    { $limit: 6 },
  ]);

  const featuredDestinations = featuredDestinationsAggregation.map(item => ({
    destinationId: item._id,
    image: item.image,
    locationLabel: `${item.city}, ${item.country}`,
    recommendedStayCount: item.stays,
    subtitle: `${item.stays} recommend stay${item.stays > 1 ? 's' : ''}`,
  }));

  return {
    featuredDestinations,
    featuredHotels: featuredHotels.map(mapHotelCard),
  };
}

async function getDestinationSuggestions(query) {
  const searchConditions = buildSearchConditions(query);
  const pipeline = [
    ...(searchConditions.length
      ? [
          {
            $match: {
              $and: searchConditions,
            },
          },
        ]
      : []),
    {
      $group: {
        _id: '$location.destinationId',
        area: { $first: '$location.area' },
        city: { $first: '$location.city' },
        country: { $first: '$location.country' },
        image: { $first: { $arrayElemAt: ['$images', 0] } },
        propertyCount: { $sum: 1 },
      },
    },
    { $sort: { propertyCount: -1, city: 1 } },
    { $limit: 8 },
  ];

  const items = await Hotel.aggregate(pipeline);

  return items.map(item => ({
    destinationId: item._id,
    image: item.image,
    label: `${item.city}, ${item.country}`,
    secondaryLabel: `${item.propertyCount} properties in ${item.area}`,
  }));
}

async function listHotels(query) {
  const page = parsePositiveNumber(query.page) || 1;
  const limit = Math.min(parsePositiveNumber(query.limit) || 12, 30);
  const cursorOffset = parseCursor(query.cursor);
  const minPrice = query.minPrice ? parsePositiveNumber(query.minPrice) : null;
  const maxPrice = query.maxPrice ? parsePositiveNumber(query.maxPrice) : null;
  const minRating = query.minRating ? Number(query.minRating) : null;
  const adults = parsePositiveNumber(query.adults);
  const children = query.children ? Math.max(Number(query.children), 0) : 0;
  const rooms = parsePositiveNumber(query.rooms);
  const sortBy = String(query.sortBy || 'recommended');
  const normalizedQuery = String(query.searchText || query.query || '').trim();
  const destinationId = String(query.destinationId || '').trim();
  const amenities = String(query.amenities || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  if (query.adults && !adults) {
    throw new AppError('Adults must be a positive number.', 400);
  }

  if (query.rooms && !rooms) {
    throw new AppError('Rooms must be a positive number.', 400);
  }

  if (query.children && (!Number.isFinite(children) || children < 0)) {
    throw new AppError('Children must be zero or greater.', 400);
  }

  const dateRange = parseDateRange(query.checkIn, query.checkOut);

  const filters = {};
  filters.status = 'active';
  const andConditions = [];

  if (destinationId) {
    filters['location.destinationId'] = destinationId;
  }

  if (normalizedQuery) {
    andConditions.push(...buildSearchConditions(normalizedQuery));
  }

  if (minPrice || maxPrice) {
    filters['pricing.nightlyRate'] = {};
    if (minPrice) {
      filters['pricing.nightlyRate'].$gte = minPrice;
    }
    if (maxPrice) {
      filters['pricing.nightlyRate'].$lte = maxPrice;
    }
  }

  if (Number.isFinite(minRating) && minRating > 0) {
    filters.rating = { $gte: minRating };
  }

  if (amenities.length > 0) {
    filters.amenities = { $all: amenities };
  }

  if (adults || children) {
    filters.maxGuests = { $gte: (adults || 0) + children };
  }

  if (rooms) {
    filters.availableRooms = { $gte: rooms };
  }

  if (andConditions.length > 0) {
    filters.$and = andConditions;
  }

  const sortMap = {
    priceAsc: { 'pricing.nightlyRate': 1, rating: -1 },
    priceDesc: { 'pricing.nightlyRate': -1, rating: -1 },
    ratingDesc: { rating: -1, reviewCount: -1 },
    recommended: { featured: -1, rating: -1, reviewCount: -1 },
  };
  const skip = cursorOffset ?? (page - 1) * limit;

  const [hotels, total] = await Promise.all([
    Hotel.find(filters)
      .sort(sortMap[sortBy] || sortMap.recommended)
      .skip(skip)
      .limit(limit),
    Hotel.countDocuments(filters),
  ]);
  const items = hotels.map(mapHotelCard);
  const hasMore = skip + items.length < total;

  return {
    items,
    pagination: {
      hasMore,
      limit,
      nextCursor: hasMore ? buildCursor(skip + items.length) : null,
      page: Math.floor(skip / limit) + 1,
      total,
      totalCount: total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}

async function getHotelDetails(slug) {
  const hotel = await Hotel.findOne({ slug, status: 'active' });

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  const availability = await getAvailabilityForHotel(
    hotel,
    parseDateRange(null, null),
  );

  return mapHotelDetails(hotel, availability);
}

async function getHotelDetailsForStay(slug, query) {
  const hotel = await Hotel.findOne({ slug, status: 'active' });

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  const availability = await getAvailabilityForHotel(
    hotel,
    parseDateRange(query.checkIn, query.checkOut),
  );

  return mapHotelDetails(hotel, availability);
}

module.exports = {
  buildLocationLabel,
  buildSearchConditions,
  getDestinationSuggestions,
  getHomeContent,
  getHotelDetails,
  getHotelDetailsForStay,
  getRoomTypes,
  listHotels,
  mapHotelCard,
  mapHotelDetails,
  parseDateRange,
};
