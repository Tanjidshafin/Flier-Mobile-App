const { Server } = require('socket.io');

const { User } = require('../models/User');
const { verifyAuthToken } = require('../utils/authToken');
const { setRealtimeHub } = require('./realtimeHub');

function attachSocketServer(server, clientUrls = []) {
  const io = new Server(server, {
    cors: {
      credentials: true,
      origin: clientUrls.length > 0 ? clientUrls : true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const bearerToken = socket.handshake.auth?.token || socket.handshake.headers.authorization;
      const token = String(bearerToken || '').replace(/^Bearer\s+/i, '').trim();

      if (!token) {
        return next(new Error('Authorization token is required.'));
      }

      const payload = verifyAuthToken(token);
      const user = await User.findById(payload.sub).select('_id role status');

      if (!user) {
        return next(new Error('Invalid authentication token.'));
      }

      if (user.status === 'suspended') {
        return next(new Error('Your account has been suspended.'));
      }

      socket.userId = payload.sub;
      socket.userRole = user.role || 'user';
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on('connection', socket => {
    socket.join(`user:${socket.userId}`);
    if (socket.userRole === 'admin') {
      socket.join('admins');
    }

    socket.on('conversation:join', conversationId => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('conversation:leave', conversationId => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on('conversation:typing', payload => {
      if (!payload?.conversationId) {
        return;
      }

      socket.to(`conversation:${payload.conversationId}`).emit('conversation:typing', {
        conversationId: payload.conversationId,
        isTyping: Boolean(payload.isTyping),
      });
    });
  });

  setRealtimeHub(io);
  return io;
}

module.exports = {
  attachSocketServer,
};
