const { Hotel } = require('../models/Hotel');
const { AppError } = require('../utils/AppError');

function buildLocationLabel(location) {
  return `${location.area}, ${location.city}, ${location.country}`;
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

function mapHotelDetails(hotel) {
  return {
    ...mapHotelCard(hotel),
    availableRooms: hotel.availableRooms,
    description: hotel.description,
    images: hotel.images,
    policies: hotel.policies,
    pricing: hotel.pricing,
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

async function getHomeContent() {
  const featuredHotels = await Hotel.find({ featured: true })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(8);

  const featuredDestinationsAggregation = await Hotel.aggregate([
    { $match: { featuredDestination: true } },
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
  const normalizedQuery = String(query || '').trim();
  const pipeline = [
    ...(normalizedQuery
      ? [
          {
            $match: {
              $or: [
                { 'location.city': { $regex: normalizedQuery, $options: 'i' } },
                { 'location.country': { $regex: normalizedQuery, $options: 'i' } },
                { 'location.area': { $regex: normalizedQuery, $options: 'i' } },
              ],
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
  const minPrice = query.minPrice ? parsePositiveNumber(query.minPrice) : null;
  const maxPrice = query.maxPrice ? parsePositiveNumber(query.maxPrice) : null;
  const minRating = query.minRating ? Number(query.minRating) : null;
  const adults = parsePositiveNumber(query.adults);
  const children = query.children ? Math.max(Number(query.children), 0) : 0;
  const rooms = parsePositiveNumber(query.rooms);
  const sortBy = String(query.sortBy || 'recommended');
  const normalizedQuery = String(query.query || '').trim();
  const destinationId = String(query.destinationId || '').trim();
  const amenities = String(query.amenities || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  parseDateRange(query.checkIn, query.checkOut);

  const filters = {};

  if (destinationId) {
    filters['location.destinationId'] = destinationId;
  }

  if (normalizedQuery) {
    filters.$or = [
      { name: { $regex: normalizedQuery, $options: 'i' } },
      { 'location.city': { $regex: normalizedQuery, $options: 'i' } },
      { 'location.country': { $regex: normalizedQuery, $options: 'i' } },
      { 'location.area': { $regex: normalizedQuery, $options: 'i' } },
    ];
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

  const sortMap = {
    priceAsc: { 'pricing.nightlyRate': 1, rating: -1 },
    priceDesc: { 'pricing.nightlyRate': -1, rating: -1 },
    ratingDesc: { rating: -1, reviewCount: -1 },
    recommended: { featured: -1, rating: -1, reviewCount: -1 },
  };

  const [hotels, total] = await Promise.all([
    Hotel.find(filters)
      .sort(sortMap[sortBy] || sortMap.recommended)
      .skip((page - 1) * limit)
      .limit(limit),
    Hotel.countDocuments(filters),
  ]);

  return {
    items: hotels.map(mapHotelCard),
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}

async function getHotelDetails(slug) {
  const hotel = await Hotel.findOne({ slug });

  if (!hotel) {
    throw new AppError('Hotel not found.', 404);
  }

  return mapHotelDetails(hotel);
}

module.exports = {
  buildLocationLabel,
  getDestinationSuggestions,
  getHomeContent,
  getHotelDetails,
  listHotels,
  mapHotelCard,
  mapHotelDetails,
  parseDateRange,
};
