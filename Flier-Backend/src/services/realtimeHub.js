let realtimeHub = null;

function setRealtimeHub(io) {
  realtimeHub = io;
}

function getRealtimeHub() {
  return realtimeHub;
}

function emitToUser(userId, eventName, payload) {
  if (!realtimeHub || !userId) {
    return;
  }

  realtimeHub.to(`user:${userId}`).emit(eventName, payload);
}

function emitToConversation(conversationId, eventName, payload) {
  if (!realtimeHub || !conversationId) {
    return;
  }

  realtimeHub.to(`conversation:${conversationId}`).emit(eventName, payload);
}

module.exports = {
  emitToConversation,
  emitToUser,
  getRealtimeHub,
  setRealtimeHub,
};
