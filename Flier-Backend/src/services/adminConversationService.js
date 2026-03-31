const { Conversation } = require('../models/Conversation');
const { Message } = require('../models/Message');
const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const { createNotification } = require('./notificationService');
const { mapConversation, mapMessage } = require('./conversationService');
const { emitToConversation, emitToUser } = require('./realtimeHub');
const {
  buildPagination,
  escapeRegex,
  parsePagination,
} = require('./adminShared');

async function ensureAdminConversation(conversationId) {
  const conversation = await Conversation.findById(conversationId).populate(
    'user',
    'fullName email role status',
  );

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  return conversation;
}

async function listAdminConversations(query) {
  const { limit, page, skip } = parsePagination(query, {
    defaultLimit: 12,
    maxLimit: 40,
  });
  const unreadOnly = String(query.unreadOnly || '').trim() === 'true';
  const search = String(query.search || '').trim();
  const filters = {};

  if (unreadOnly) {
    filters.adminUnreadCount = { $gt: 0 };
  }

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: 'i' };
    const matchedUsers = await User.find({
      $or: [{ fullName: regex }, { email: regex }],
    }).select('_id');
    const matchedUserIds = matchedUsers.map(user => user._id);

    filters.$or = [
      { 'hotelSnapshot.locationLabel': regex },
      { 'hotelSnapshot.name': regex },
      { subject: regex },
      ...(matchedUserIds.length > 0 ? [{ user: { $in: matchedUserIds } }] : []),
    ];
  }

  const [conversations, total] = await Promise.all([
    Conversation.find(filters)
      .populate('user', 'fullName email role status')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(filters),
  ]);

  const conversationIds = conversations.map(conversation => conversation._id);
  const latestMessages = await Message.find({ conversation: { $in: conversationIds } }).sort({
    createdAt: -1,
  });
  const latestByConversation = new Map();

  for (const message of latestMessages) {
    const key = message.conversation.toString();

    if (!latestByConversation.has(key)) {
      latestByConversation.set(key, message);
    }
  }

  return {
    items: conversations.map(conversation =>
      mapConversation(
        conversation,
        latestByConversation.get(conversation._id.toString()) || null,
        { includeUser: true, viewer: 'admin' },
      ),
    ),
    pagination: buildPagination({ limit, page, total }),
  };
}

async function listAdminMessages(conversationId) {
  const conversation = await ensureAdminConversation(conversationId);
  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

  return {
    conversation: mapConversation(conversation, null, {
      includeUser: true,
      viewer: 'admin',
    }),
    messages: messages.map(mapMessage),
  };
}

async function sendAdminMessage(adminUser, conversationId, payload) {
  const conversation = await ensureAdminConversation(conversationId);
  const body = String(payload.body || '').trim();

  if (!body) {
    throw new AppError('Message body is required.', 400);
  }

  const adminMessage = await Message.create({
    body,
    conversation: conversation._id,
    deliveredAt: new Date(),
    senderRole: 'admin',
    status: 'delivered',
    user: adminUser._id,
  });

  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = body;
  conversation.userUnreadCount = (conversation.userUnreadCount || 0) + 1;
  await conversation.save();

  const mappedMessage = mapMessage(adminMessage);
  emitToConversation(conversation._id.toString(), 'chat:message:new', mappedMessage);
  emitToUser(conversation.user._id.toString(), 'chat:message:delivered', mappedMessage);

  await createNotification({
    body: `Support replied about ${conversation.hotelSnapshot.name}.`,
    data: {
      conversationId: conversation._id.toString(),
      hotelSlug: conversation.hotelSnapshot.slug,
      routeName: 'Chat',
    },
    title: 'New support message',
    type: 'chat_message',
    userId: conversation.user._id,
  });

  return mappedMessage;
}

async function markAdminConversationSeen(conversationId) {
  const conversation = await ensureAdminConversation(conversationId);
  const now = new Date();

  await Message.updateMany(
    {
      conversation: conversation._id,
      seenAt: null,
      senderRole: 'user',
    },
    {
      seenAt: now,
      status: 'seen',
    },
  );

  conversation.adminUnreadCount = 0;
  await conversation.save();

  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
  return messages.map(mapMessage);
}

module.exports = {
  listAdminConversations,
  listAdminMessages,
  markAdminConversationSeen,
  sendAdminMessage,
};
