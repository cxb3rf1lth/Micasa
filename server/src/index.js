require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./config/database');
const { apiLimiter, authLimiter, staticLimiter } = require('./middleware/rateLimiter');
const User = require('./models/User');

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
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000']
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
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
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findById(decoded.id);

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Helper function to get household ID
const getHouseholdId = (user) => {
  return user.partnerId
    ? [user.id.toString(), user.partnerId.toString()].sort().join('-')
    : `household_${user.id}`;
};

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id, 'User:', socket.user.displayName);

  socket.on('join-household', (householdId) => {
    // Verify user owns this household
    const userHouseholdId = getHouseholdId(socket.user);

    if (householdId !== userHouseholdId) {
      console.log(`Socket ${socket.id} attempted to join unauthorized household ${householdId}`);
      socket.emit('error', { message: 'Unauthorized household access' });
      return;
    }

    socket.join(householdId);
    console.log(`Socket ${socket.id} joined household ${householdId}`);
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
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Micasa API is running' });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
