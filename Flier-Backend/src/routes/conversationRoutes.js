const express = require('express');

const {
  createConversation,
  listConversations,
  listMessages,
  markConversationSeen,
  sendMessage,
} = require('../controllers/conversationController');
const { authenticateRequest } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.get('/', asyncHandler(listConversations));
router.post('/', asyncHandler(createConversation));
router.get('/:id/messages', asyncHandler(listMessages));
router.post('/:id/messages', asyncHandler(sendMessage));
router.post('/:id/seen', asyncHandler(markConversationSeen));

module.exports = router;
