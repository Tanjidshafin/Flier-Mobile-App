jest.mock('../src/models/Conversation', () => ({
  Conversation: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Hotel', () => ({
  Hotel: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Message', () => ({
  Message: {
    create: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../src/services/notificationService', () => ({
  createAdminNotifications: jest.fn().mockResolvedValue([]),
  createNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('../src/services/realtimeHub', () => ({
  emitToConversation: jest.fn(),
  emitToUser: jest.fn(),
}));

const { Conversation } = require('../src/models/Conversation');
const { Message } = require('../src/models/Message');
const conversationService = require('../src/services/conversationService');

describe('conversationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sendMessage increments admin unread count without creating an auto-reply', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const conversation = {
      _id: 'conversation-1',
      adminUnreadCount: 0,
      hotelSnapshot: {
        name: 'Skyline Suites',
        slug: 'skyline-suites',
      },
      lastMessagePreview: '',
      save,
      user: 'user-1',
    };

    Conversation.findOne.mockResolvedValue(conversation);
    Message.create.mockResolvedValue({
      _id: 'message-1',
      body: 'Is breakfast included?',
      conversation: 'conversation-1',
      createdAt: '2026-03-31T10:00:00.000Z',
      deliveredAt: '2026-03-31T10:00:00.000Z',
      seenAt: '2026-03-31T10:00:00.000Z',
      senderRole: 'user',
      status: 'seen',
      user: 'user-1',
    });

    const result = await conversationService.sendMessage(
      'user-1',
      'conversation-1',
      { body: 'Is breakfast included?' },
    );

    expect(Message.create).toHaveBeenCalledTimes(1);
    expect(conversation.adminUnreadCount).toBe(1);
    expect(conversation.lastMessagePreview).toBe('Is breakfast included?');
    expect(save).toHaveBeenCalled();
    expect(result.body).toBe('Is breakfast included?');
  });
});
