jest.mock('../src/models/Booking', () => ({
  Booking: {
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../src/models/Hotel', () => ({
  Hotel: {
    countDocuments: jest.fn(),
  },
}));

jest.mock('../src/models/Message', () => ({
  Message: {
    find: jest.fn(),
  },
}));

jest.mock('../src/models/User', () => ({
  User: {
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

const { Booking } = require('../src/models/Booking');
const { Hotel } = require('../src/models/Hotel');
const { Message } = require('../src/models/Message');
const { User } = require('../src/models/User');
const adminDashboardService = require('../src/services/adminDashboardService');

describe('adminDashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getDashboardSummary calculates net revenue and recent activity', async () => {
    User.countDocuments.mockResolvedValueOnce(14).mockResolvedValueOnce(2);
    Hotel.countDocuments.mockResolvedValue(6);
    Booking.countDocuments.mockResolvedValue(11);
    Booking.aggregate.mockResolvedValue([
      {
        paidConfirmedRevenue: 1200,
        refundedRevenue: 200,
      },
    ]);
    User.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([
        {
          _id: 'user-1',
          createdAt: '2026-03-31T08:00:00.000Z',
          email: 'guest@example.com',
          fullName: 'Guest User',
        },
      ]),
    });
    Booking.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([
        {
          _id: 'booking-1',
          confirmationCode: 'FLR-123456',
          createdAt: '2026-03-31T09:00:00.000Z',
          hotelSnapshot: { name: 'Skyline Suites' },
        },
      ]),
    });
    Message.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([
        {
          _id: 'message-1',
          body: 'Need airport pickup',
          conversation: {
            hotelSnapshot: { name: 'Skyline Suites' },
            user: { fullName: 'Guest User' },
          },
          createdAt: '2026-03-31T10:00:00.000Z',
        },
      ]),
    });

    const result = await adminDashboardService.getDashboardSummary();

    expect(result.stats.netRevenue).toBe(1000);
    expect(result.stats.totalUsers).toBe(14);
    expect(result.recentActivity[0].type).toBe('message');
  });
});
