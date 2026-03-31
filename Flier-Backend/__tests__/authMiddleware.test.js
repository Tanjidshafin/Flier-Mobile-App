jest.mock('../src/models/User', () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/utils/authToken', () => ({
  verifyAuthToken: jest.fn(() => ({ sub: 'user-1' })),
}));

const { User } = require('../src/models/User');
const { authenticateRequest, requireAdmin } = require('../src/middleware/authMiddleware');

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('authenticateRequest rejects suspended users', async () => {
    User.findById.mockResolvedValue({
      _id: 'user-1',
      role: 'user',
      status: 'suspended',
    });

    const next = jest.fn();

    await authenticateRequest(
      { headers: { authorization: 'Bearer test-token' } },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Your account has been suspended.');
  });

  test('requireAdmin rejects non-admin users', () => {
    const next = jest.fn();

    requireAdmin(
      {
        user: {
          role: 'user',
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Admin access is required.');
  });

  test('requireAdmin allows admins through', () => {
    const next = jest.fn();

    requireAdmin(
      {
        user: {
          role: 'admin',
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});
