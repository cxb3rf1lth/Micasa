require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketio = require('socket.io');
const { connectDB } = require('./config/database');
const { apiLimiter, authLimiter, staticLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
}));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Add payload size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/shopping', require('./routes/shopping'));
app.use('/api/chores', require('./routes/chores'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/whiteboard', require('./routes/whiteboard'));
app.use('/api/vision-board', require('./routes/visionBoard'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Make io accessible in routes
app.set('io', io);

// Socket.IO authentication middleware
const jwt = require('jsonwebtoken');
const User = require('./models/User');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // FIXED: Added await

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id;
    socket.user = user;
    next();
  } catch (error) {
    logger.error('Socket authentication error:', {
      error: error.message,
      stack: error.stack,
      socketId: socket.id
    });
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('New client connected', {
    socketId: socket.id,
    userId: socket.userId
  });

  socket.on('join-household', (householdId) => {
    // Verify user belongs to this household
    const userHouseholdId = socket.user.partnerId
      ? [socket.userId.toString(), socket.user.partnerId.toString()].sort().join('-')
      : socket.userId.toString();

    if (householdId !== userHouseholdId) {
      socket.emit('error', { message: 'Unauthorized: Cannot join this household' });
      return;
    }

    socket.join(householdId);
    logger.info('Socket joined household', {
      socketId: socket.id,
      householdId
    });
  });

  socket.on('shopping-updated', (data) => {
    socket.to(data.householdId).emit('shopping-updated', data);
  });

  socket.on('chore-updated', (data) => {
    socket.to(data.householdId).emit('chore-updated', data);
  });

  socket.on('appointment-updated', (data) => {
    socket.to(data.householdId).emit('appointment-updated', data);
  });

  socket.on('todo-updated', (data) => {
    socket.to(data.householdId).emit('todo-updated', data);
  });

  socket.on('reminder-updated', (data) => {
    socket.to(data.householdId).emit('reminder-updated', data);
  });

  socket.on('whiteboard-updated', (data) => {
    socket.to(data.householdId).emit('whiteboard-updated', data);
  });

  socket.on('vision-board-updated', (data) => {
    socket.to(data.householdId).emit('vision-board-updated', data);
  });

  socket.on('message-received', (data) => {
    socket.to(data.householdId).emit('message-received', data);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', {
      socketId: socket.id,
      userId: socket.userId
    });
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  // Apply rate limiting to SPA fallback route
  app.get('*', staticLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🏠 Micasa Server started`, {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
  });
});

module.exports = { app, io };
