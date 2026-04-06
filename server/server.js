const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', process.env.ADMIN_URL || 'http://localhost:5174'],
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', process.env.ADMIN_URL || 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_admin', () => socket.join('admin'));
  socket.on('join_order', (orderId) => socket.join(`order_${orderId}`));
  socket.on('join_kitchen', () => socket.join('kitchen'));

  socket.on('update_order_status', (data) => {
    io.to('admin').emit('order_status_changed', data);
    io.to(`order_${data.orderId}`).emit('order_status_changed', data);
    io.to('kitchen').emit('order_status_changed', data);
  });

  socket.on('new_order_placed', (data) => {
    io.to('admin').emit('new_order', data);
    io.to('kitchen').emit('new_order', data);
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_db')
  .then(() => {
    console.log('✅ MongoDB connected');
    // Seed initial data if needed
    const seedIfEmpty = require('./seed');
    seedIfEmpty();
  })
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
