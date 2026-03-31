jest.mock('../src/models/Hotel', () => ({
  Hotel: {
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

const { Hotel } = require('../src/models/Hotel');
const hotelService = require('../src/services/hotelService');

describe('hotelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getHomeContent returns featured hotels and destinations', async () => {
    Hotel.find.mockReturnValue({
      limit: jest.fn().mockResolvedValue([
        {
          _id: 'hotel-1',
          amenities: ['Wifi'],
          baths: 1,
          featured: true,
          images: ['image-1'],
          location: {
            address: 'addr',
            area: 'Ubud',
            city: 'Bali',
            country: 'Indonesia',
            destinationId: 'bali',
          },
          maxGuests: 2,
          name: 'Kayon',
          pricing: { currency: 'USD', nightlyRate: 120 },
          rating: 4.8,
          reviewCount: 99,
          rooms: 1,
          shortDescription: 'Quiet stay',
          slug: 'kayon',
          squareMeters: 40,
          tag: 'Boutique',
        },
      ]),
      sort: jest.fn().mockReturnThis(),
    });

    Hotel.aggregate.mockResolvedValue([
      {
        _id: 'bali',
        city: 'Bali',
        country: 'Indonesia',
        image: 'image-1',
        stays: 4,
      },
    ]);

    const result = await hotelService.getHomeContent();

    expect(result.featuredHotels).toHaveLength(1);
    expect(result.featuredDestinations[0].destinationId).toBe('bali');
  });

  test('listHotels applies search filters and pagination', async () => {
    const sort = jest.fn().mockReturnThis();
    const skip = jest.fn().mockReturnThis();
    const limit = jest.fn().mockResolvedValue([]);
    Hotel.find.mockReturnValue({ limit, skip, sort });
    Hotel.countDocuments.mockResolvedValue(0);

    await hotelService.listHotels({
      adults: '2',
      amenities: 'Wifi,Pool',
      destinationId: 'bali',
      limit: '10',
      minRating: '4.5',
      page: '2',
      query: 'ubud',
      rooms: '1',
      sortBy: 'priceAsc',
    });

    expect(Hotel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        amenities: { $all: ['Wifi', 'Pool'] },
        availableRooms: { $gte: 1 },
        maxGuests: { $gte: 2 },
        rating: { $gte: 4.5 },
        status: 'active',
      }),
    );
    expect(skip).toHaveBeenCalledWith(10);
  });

  test('getHotelDetails throws when hotel is missing', async () => {
    Hotel.findOne.mockResolvedValue(null);

    await expect(hotelService.getHotelDetails('missing-hotel')).rejects.toThrow(
      'Hotel not found.',
    );
  });
});
