const conversationService = require('../services/conversationService');

async function createConversation(req, res) {
  const data = await conversationService.createConversation(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Conversation created successfully.',
    data,
  });
}

async function listConversations(req, res) {
  const data = await conversationService.listConversations(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Conversations fetched successfully.',
    data,
  });
}

async function listMessages(req, res) {
  const data = await conversationService.listMessages(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Messages fetched successfully.',
    data,
  });
}

async function sendMessage(req, res) {
  const data = await conversationService.sendMessage(
    req.user._id,
    req.params.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: 'Message sent successfully.',
    data,
  });
}

async function markConversationSeen(req, res) {
  const data = await conversationService.markConversationSeen(
    req.user._id,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    message: 'Conversation marked as seen.',
    data,
  });
}

module.exports = {
  createConversation,
  listConversations,
  listMessages,
  markConversationSeen,
  sendMessage,
};
