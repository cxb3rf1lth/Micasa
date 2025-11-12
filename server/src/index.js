require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/database');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/shopping', require('./routes/shopping'));
app.use('/api/chores', require('./routes/chores'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/reminders', require('./routes/reminders'));

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-household', (householdId) => {
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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Micasa API is running' });
});

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
