const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Track viewers per app
  const appViewers = {};

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins app detail page
    socket.on('join_app', (appId) => {
      socket.join(`app:${appId}`);
      if (!appViewers[appId]) appViewers[appId] = new Set();
      appViewers[appId].add(socket.id);
      
      // Broadcast viewer count
      io.to(`app:${appId}`).emit('viewer_count', {
        appId,
        count: appViewers[appId].size,
      });
    });

    // User leaves app detail page
    socket.on('leave_app', (appId) => {
      socket.leave(`app:${appId}`);
      if (appViewers[appId]) {
        appViewers[appId].delete(socket.id);
        io.to(`app:${appId}`).emit('viewer_count', {
          appId,
          count: appViewers[appId].size,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Clean up from all app rooms
      Object.keys(appViewers).forEach((appId) => {
        if (appViewers[appId].has(socket.id)) {
          appViewers[appId].delete(socket.id);
          io.to(`app:${appId}`).emit('viewer_count', {
            appId,
            count: appViewers[appId].size,
          });
        }
      });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Emit helpers
const emitInstallCountUpdated = (appId, count) => {
  if (io) {
    io.to(`app:${appId}`).emit('install_count_updated', { appId, count });
    io.emit('chart_updated', { appId, count }); // Global chart update
  }
};

const emitNewReview = (appId, review) => {
  if (io) {
    io.to(`app:${appId}`).emit('new_review', { appId, review });
  }
};

const emitNewApp = (app) => {
  if (io) {
    io.emit('app:new', { app });
  }
};

module.exports = { initSocket, getIO, emitInstallCountUpdated, emitNewReview, emitNewApp };
