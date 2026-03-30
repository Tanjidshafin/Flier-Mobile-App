jest.mock('../src/models/User', () => ({
  User: {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/utils/authToken', () => ({
  signAuthToken: jest.fn(() => 'mock-token'),
}));

const bcrypt = require('bcryptjs');

const { User } = require('../src/models/User');
const authService = require('../src/services/authService');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registerUser creates a new account with full name and email', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'user-1',
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      phoneNumber: null,
    });

    const result = await authService.registerUser({
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      password: 'secret12',
    });

    expect(result.token).toBe('mock-token');
    expect(result.user.fullName).toBe('Demo Traveler');
    expect(User.create).toHaveBeenCalled();
  });

  test('loginUser rejects invalid password', async () => {
    const passwordHash = await bcrypt.hash('secret12', 4);
    User.findOne.mockResolvedValue({
      _id: 'user-1',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      passwordHash,
      phoneNumber: '+6281234567890',
    });

    await expect(
      authService.loginUser({
        email: 'demo@example.com',
        password: 'wrong-pass',
      }),
    ).rejects.toThrow('Invalid email or password.');
  });

  test('getCurrentUser returns the active session payload', async () => {
    User.findById.mockResolvedValue({
      _id: 'user-1',
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      phoneNumber: '+6281234567890',
    });

    const result = await authService.getCurrentUser('user-1');

    expect(result.user.email).toBe('demo@example.com');
    expect(result.user.phoneNumber).toBe('+6281234567890');
  });
});
