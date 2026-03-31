jest.mock('../src/models/User', () => ({
  User: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/services/notificationService', () => ({
  createAdminNotifications: jest.fn().mockResolvedValue([]),
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
    delete process.env.ADMIN_BOOTSTRAP_EMAILS;
  });

  test('registerUser creates a new account with full name and email', async () => {
    User.findOne.mockResolvedValue(null);
    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });
    User.create.mockResolvedValue({
      _id: 'user-1',
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      phoneNumber: null,
      role: 'user',
      save: jest.fn().mockResolvedValue(undefined),
      status: 'active',
    });

    const result = await authService.registerUser({
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      password: 'secret12',
    });

    expect(result.token).toBe('mock-token');
    expect(result.user.fullName).toBe('Demo Traveler');
    expect(result.user.role).toBe('user');
    expect(User.create).toHaveBeenCalled();
  });

  test('registerUser promotes configured bootstrap emails to admin', async () => {
    process.env.ADMIN_BOOTSTRAP_EMAILS = 'owner@example.com';
    const save = jest.fn().mockResolvedValue(undefined);

    User.findOne.mockResolvedValue(null);
    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });
    User.create.mockResolvedValue({
      _id: 'user-1',
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'owner@example.com',
      fullName: 'Owner',
      phoneNumber: null,
      role: 'user',
      save,
      status: 'active',
    });

    const result = await authService.registerUser({
      email: 'owner@example.com',
      fullName: 'Owner',
      password: 'secret12',
    });

    expect(save).toHaveBeenCalled();
    expect(result.user.role).toBe('admin');
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

  test('loginUser rejects suspended accounts', async () => {
    const passwordHash = await bcrypt.hash('secret12', 4);
    User.findOne.mockResolvedValue({
      _id: 'user-1',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      passwordHash,
      phoneNumber: '+6281234567890',
      role: 'user',
      status: 'suspended',
    });

    await expect(
      authService.loginUser({
        email: 'demo@example.com',
        password: 'secret12',
      }),
    ).rejects.toThrow('Your account has been suspended.');
  });

  test('getCurrentUser returns the active session payload', async () => {
    User.findById.mockResolvedValue({
      _id: 'user-1',
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'demo@example.com',
      fullName: 'Demo Traveler',
      phoneNumber: '+6281234567890',
      role: 'user',
      status: 'active',
    });

    const result = await authService.getCurrentUser('user-1');

    expect(result.user.email).toBe('demo@example.com');
    expect(result.user.phoneNumber).toBe('+6281234567890');
  });
});
