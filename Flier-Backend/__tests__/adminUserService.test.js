jest.mock('../src/models/User', () => ({
  User: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

const { User } = require('../src/models/User');
const adminUserService = require('../src/services/adminUserService');

describe('adminUserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updateUserRole prevents removing the last active admin', async () => {
    User.findById.mockResolvedValue({
      _id: 'target-admin',
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'admin@example.com',
      fullName: 'Admin',
      role: 'admin',
      save: jest.fn(),
      status: 'active',
    });
    User.countDocuments.mockResolvedValue(0);

    await expect(
      adminUserService.updateUserRole(
        { _id: 'actor-admin' },
        'target-admin',
        { role: 'user' },
      ),
    ).rejects.toThrow('At least one active admin account must remain.');
  });

  test('updateUserStatus stores suspension metadata', async () => {
    const user = {
      _id: 'user-2',
      avatar: { publicId: null, url: null },
      createdAt: '2026-03-30T00:00:00.000Z',
      email: 'traveler@example.com',
      fullName: 'Traveler',
      phoneNumber: null,
      role: 'user',
      save: jest.fn().mockResolvedValue(undefined),
      status: 'active',
      suspendedAt: null,
      suspensionReason: null,
    };
    User.findById.mockResolvedValue(user);

    const result = await adminUserService.updateUserStatus(
      { _id: 'actor-admin' },
      'user-2',
      { reason: 'Abusive behavior', status: 'suspended' },
    );

    expect(user.save).toHaveBeenCalled();
    expect(result.status).toBe('suspended');
    expect(result.suspensionReason).toBe('Abusive behavior');
  });
});
