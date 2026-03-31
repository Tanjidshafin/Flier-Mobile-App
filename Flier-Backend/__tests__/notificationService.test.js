jest.mock('../src/models/Notification', () => ({
  Notification: {
    create: jest.fn(),
  },
}));

jest.mock('../src/models/User', () => ({
  User: {
    find: jest.fn(),
  },
}));

jest.mock('../src/services/realtimeHub', () => ({
  emitToUser: jest.fn(),
}));

const { Notification } = require('../src/models/Notification');
const { User } = require('../src/models/User');
const { emitToUser } = require('../src/services/realtimeHub');
const notificationService = require('../src/services/notificationService');

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createAdminNotifications fans out to every active admin', async () => {
    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: 'admin-1' }, { _id: 'admin-2' }]),
    });
    Notification.create
      .mockResolvedValueOnce({
        _id: 'notif-1',
        body: 'Body',
        createdAt: '2026-03-31T00:00:00.000Z',
        data: {},
        readAt: null,
        scope: 'admin',
        title: 'Title',
        type: 'system_alert',
      })
      .mockResolvedValueOnce({
        _id: 'notif-2',
        body: 'Body',
        createdAt: '2026-03-31T00:00:00.000Z',
        data: {},
        readAt: null,
        scope: 'admin',
        title: 'Title',
        type: 'system_alert',
      });

    const result = await notificationService.createAdminNotifications({
      body: 'Body',
      title: 'Title',
      type: 'system_alert',
    });

    expect(Notification.create).toHaveBeenCalledTimes(2);
    expect(emitToUser).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });
});
