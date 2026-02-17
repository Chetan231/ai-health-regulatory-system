import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);

    // Join personal room
    socket.join(socket.userId);

    // Chat
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    socket.on('send_message', (data) => {
      // Broadcast to chat room (excluding sender)
      socket.to(`chat_${data.chatId}`).emit('receive_message', data);
    });

    socket.on('typing', ({ chatId, userName }) => {
      socket.to(`chat_${chatId}`).emit('user_typing', { chatId, userName });
    });

    socket.on('stop_typing', ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit('user_stop_typing', { chatId });
    });

    // Video call signaling
    socket.on('call_user', ({ to, signalData, from, callerName }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('incoming_call', { signal: signalData, from, callerName });
      }
    });

    socket.on('answer_call', ({ to, signalData }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('call_accepted', { signal: signalData });
      }
    });

    socket.on('end_call', ({ to }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('call_ended');
      }
    });

    socket.on('reject_call', ({ to }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('call_rejected');
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const sendNotification = (userId, notification) => {
  if (io) {
    io.to(userId).emit('new_notification', notification);
  }
};

export const isUserOnline = (userId) => onlineUsers.has(userId);
