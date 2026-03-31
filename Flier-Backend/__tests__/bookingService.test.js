jest.mock('../src/models/Booking', () => ({
  Booking: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Hotel', () => ({
  Hotel: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/User', () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/services/notificationService', () => ({
  createAdminNotifications: jest.fn().mockResolvedValue([]),
  createNotification: jest.fn().mockResolvedValue({}),
}));

const { Booking } = require('../src/models/Booking');
const { Hotel } = require('../src/models/Hotel');
const { User } = require('../src/models/User');
const bookingService = require('../src/services/bookingService');

describe('bookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createBooking saves a booking and updates phone if missing', async () => {
    const save = jest.fn().mockResolvedValue(undefined);

    User.findById.mockResolvedValue({
      _id: 'user-1',
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      phoneNumber: null,
      role: 'user',
      save,
      status: 'active',
    });

    Hotel.findById.mockResolvedValue({
      _id: 'hotel-1',
      availableRooms: 3,
      images: ['image-1'],
      location: {
        area: 'Uluwatu',
        city: 'Bali',
        country: 'Indonesia',
      },
      maxGuests: 4,
      name: 'Samudra',
      pricing: {
        cleaningFee: 10,
        currency: 'USD',
        nightlyRate: 200,
        serviceFee: 15,
        taxRate: 0.1,
      },
      slug: 'samudra',
    });

    Booking.create.mockResolvedValue({
      _id: 'booking-1',
      checkIn: '2026-04-03T00:00:00.000Z',
      checkOut: '2026-04-05T00:00:00.000Z',
      confirmationCode: 'FLR-123456',
      contactPhone: '+628123456789',
      createdAt: '2026-04-01T00:00:00.000Z',
      guests: { adults: 2, children: 1, rooms: 1 },
      hotelSnapshot: {
        coverImage: 'image-1',
        locationLabel: 'Uluwatu, Bali, Indonesia',
        name: 'Samudra',
        nightlyRate: 200,
        slug: 'samudra',
      },
      nights: 2,
      pricing: {
        baseAmount: 400,
        cleaningFee: 10,
        currency: 'USD',
        serviceFee: 15,
        taxAmount: 40,
        totalAmount: 465,
      },
      specialRequests: 'Late check-in',
      status: 'confirmed',
    });

    const result = await bookingService.createBooking('user-1', {
      adults: 2,
      checkIn: '2026-04-03',
      checkOut: '2026-04-05',
      children: 1,
      contactPhone: '+628123456789',
      hotelId: 'hotel-1',
      rooms: 1,
      specialRequests: 'Late check-in',
    });

    expect(save).toHaveBeenCalled();
    expect(result.booking.confirmationCode).toBe('FLR-123456');
    expect(result.user.phoneNumber).toBe('+628123456789');
    expect(result.user.role).toBe('user');
  });

  test('createBooking rejects bookings that exceed guest capacity', async () => {
    User.findById.mockResolvedValue({
      _id: 'user-1',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      phoneNumber: '+628123456789',
      role: 'user',
      save: jest.fn(),
      status: 'active',
    });

    Hotel.findById.mockResolvedValue({
      _id: 'hotel-1',
      availableRooms: 3,
      images: ['image-1'],
      location: {
        area: 'Uluwatu',
        city: 'Bali',
        country: 'Indonesia',
      },
      maxGuests: 2,
      name: 'Samudra',
      pricing: {
        cleaningFee: 10,
        currency: 'USD',
        nightlyRate: 200,
        serviceFee: 15,
        taxRate: 0.1,
      },
      slug: 'samudra',
    });

    await expect(
      bookingService.createBooking('user-1', {
        adults: 2,
        checkIn: '2026-04-03',
        checkOut: '2026-04-05',
        children: 2,
        hotelId: 'hotel-1',
        rooms: 1,
      }),
    ).rejects.toThrow('Selected hotel cannot accommodate that many guests.');
  });
});
