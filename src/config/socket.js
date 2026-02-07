const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Message, User } = require('../models');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('join_group', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('leave_group', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    socket.on('dm', async ({ receiverId, content }) => {
      try {
        const message = await Message.create({
          sender_id: socket.userId,
          receiver_id: receiverId,
          content,
        });
        const populated = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] }],
        });
        io.to(`user:${receiverId}`).emit('new_message', populated);
        socket.emit('message_sent', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('group_message', async ({ groupId, content }) => {
      try {
        const message = await Message.create({
          sender_id: socket.userId,
          dream_group_id: groupId,
          content,
        });
        const populated = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] }],
        });
        io.to(`group:${groupId}`).emit('new_group_message', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ receiverId, groupId }) => {
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('user_typing', { userId: socket.userId });
      }
      if (groupId) {
        socket.to(`group:${groupId}`).emit('user_typing', { userId: socket.userId });
      }
    });

    socket.on('mark_read', async ({ messageId }) => {
      try {
        await Message.update({ read_at: new Date() }, { where: { id: messageId, receiver_id: socket.userId } });
      } catch (err) {
        // silently fail
      }
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
