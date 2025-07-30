const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.user.id;
      socket.userRole = decoded.user.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected with role ${socket.userRole}`);
    
    // Join user to their role-specific room
    socket.join(socket.userRole);
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Notification functions
const sendNotification = (userId, notification) => {
  if (io) {
    io.to(userId).emit('notification', notification);
  }
};

const broadcastToRole = (role, notification) => {
  if (io) {
    io.to(role).emit('notification', notification);
  }
};

const broadcastToAll = (notification) => {
  if (io) {
    io.emit('notification', notification);
  }
};

// Specific notification types
const notifyNewNotice = (notice) => {
  const notification = {
    type: 'new_notice',
    title: 'New Notice',
    message: `New notice: ${notice.title}`,
    data: notice,
    timestamp: new Date()
  };

  if (notice.targetAudience === 'all') {
    broadcastToAll(notification);
  } else if (notice.targetAudience === 'students') {
    broadcastToRole('student', notification);
  } else if (notice.targetAudience === 'operators') {
    broadcastToRole('operator', notification);
  }
};

const notifyProfileUpdate = (userId, updateInfo) => {
  const notification = {
    type: 'profile_update',
    title: 'Profile Updated',
    message: 'Your profile has been updated',
    data: updateInfo,
    timestamp: new Date()
  };
  
  sendNotification(userId, notification);
};

const notifyNewEvent = (event) => {
  const notification = {
    type: 'new_event',
    title: 'New Event',
    message: `New event: ${event.title}`,
    data: event,
    timestamp: new Date()
  };
  
  broadcastToAll(notification);
};

module.exports = {
  initializeSocket,
  sendNotification,
  broadcastToRole,
  broadcastToAll,
  notifyNewNotice,
  notifyProfileUpdate,
  notifyNewEvent
}; 