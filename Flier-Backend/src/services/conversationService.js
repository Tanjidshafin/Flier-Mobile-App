const { Conversation } = require('../models/Conversation');
const { Hotel } = require('../models/Hotel');
const { Message } = require('../models/Message');
const { AppError } = require('../utils/AppError');
const { buildLocationLabel } = require('./hotelService');
const { createAdminNotifications, createNotification } = require('./notificationService');
const { emitToConversation, emitToUser } = require('./realtimeHub');

function mapMessage(message) {
  return {
    body: message.body,
    conversationId: message.conversation.toString(),
    createdAt: message.createdAt,
    deliveredAt: message.deliveredAt,
    id: message._id.toString(),
    seenAt: message.seenAt,
    senderRole: message.senderRole,
    status: message.status,
    userId: message.user ? message.user.toString() : null,
  };
}

function mapConversation(conversation, latestMessage, options = {}) {
  const { includeUser = false, viewer = 'user' } = options;
  const unreadCount =
    viewer === 'admin' ? conversation.adminUnreadCount || 0 : conversation.userUnreadCount || 0;

  return {
    hotel: conversation.hotelSnapshot,
    id: conversation._id.toString(),
    lastMessage: latestMessage ? mapMessage(latestMessage) : null,
    lastMessageAt: conversation.lastMessageAt,
    lastMessagePreview:
      conversation.lastMessagePreview ||
      latestMessage?.body ||
      '',
    subject: conversation.subject,
    unreadCount,
    ...(includeUser && conversation.user
      ? {
          user: {
            email: conversation.user.email,
            fullName: conversation.user.fullName,
            id: conversation.user._id.toString(),
            role: conversation.user.role || 'user',
            status: conversation.user.status || 'active',
          },
        }
      : {}),
  };
}

async function ensureConversation(userId, conversationId) {
  const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  return conversation;
}

async function createConversation(userId, payload) {
  const hotelId = String(payload.hotelId || '').trim();
  const subject = String(payload.subject || 'Hotel support').trim();

  if (!hotelId) {
    throw new AppError('Hotel id is required.', 400);
  }

  const hotel = await Hotel.findById(hotelId);

  if (!hotel || hotel.status === 'archived') {
    throw new AppError('Hotel not found.', 404);
  }

  const conversation = await Conversation.findOneAndUpdate(
    { hotel: hotel._id, user: userId },
    {
      hotel: hotel._id,
      hotelSnapshot: {
        coverImage: hotel.images[0] || null,
        locationLabel: buildLocationLabel(hotel.location),
        name: hotel.name,
        slug: hotel.slug,
      },
      lastMessageAt: new Date(),
      lastMessagePreview: '',
      subject,
      user: userId,
    },
    { new: true, setDefaultsOnInsert: true, upsert: true },
  );

  const latestMessage = await Message.findOne({ conversation: conversation._id }).sort({
    createdAt: -1,
  });

  return mapConversation(conversation, latestMessage);
}

async function listConversations(userId) {
  const conversations = await Conversation.find({ user: userId }).sort({ lastMessageAt: -1 });
  const ids = conversations.map(item => item._id);
  const messages = await Message.find({ conversation: { $in: ids } }).sort({ createdAt: -1 });
  const latestByConversation = new Map();

  for (const message of messages) {
    const key = message.conversation.toString();
    if (!latestByConversation.has(key)) {
      latestByConversation.set(key, message);
    }
  }

  return conversations.map(item =>
    mapConversation(item, latestByConversation.get(item._id.toString())),
  );
}

async function listMessages(userId, conversationId) {
  const conversation = await ensureConversation(userId, conversationId);
  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
  return messages.map(mapMessage);
}

async function sendMessage(userId, conversationId, payload) {
  const conversation = await ensureConversation(userId, conversationId);
  const body = String(payload.body || '').trim();

  if (!body) {
    throw new AppError('Message body is required.', 400);
  }

  const userMessage = await Message.create({
    body,
    conversation: conversation._id,
    deliveredAt: new Date(),
    seenAt: new Date(),
    senderRole: 'user',
    status: 'seen',
    user: userId,
  });

  conversation.adminUnreadCount = (conversation.adminUnreadCount || 0) + 1;
  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = body;
  await conversation.save();

  const mappedUserMessage = mapMessage(userMessage);
  emitToConversation(conversation._id.toString(), 'chat:message:new', mappedUserMessage);
  emitToUser(userId.toString(), 'chat:message:seen', mappedUserMessage);

  await createAdminNotifications({
    body: `New message from a guest about ${conversation.hotelSnapshot.name}.`,
    data: {
      conversationId: conversation._id.toString(),
      hotelSlug: conversation.hotelSnapshot.slug,
      routeName: 'AdminChatConversation',
    },
    title: 'New guest message',
    type: 'chat_message',
  });

  return mappedUserMessage;
}

async function markConversationSeen(userId, conversationId) {
  const conversation = await ensureConversation(userId, conversationId);
  const now = new Date();

  await Message.updateMany(
    {
      conversation: conversation._id,
      seenAt: null,
      senderRole: { $in: ['admin', 'system'] },
    },
    {
      seenAt: now,
      status: 'seen',
    },
  );

  conversation.userUnreadCount = 0;
  await conversation.save();

  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
  return messages.map(mapMessage);
}

module.exports = {
  createConversation,
  listConversations,
  listMessages,
  mapConversation,
  mapMessage,
  markConversationSeen,
  sendMessage,
};
