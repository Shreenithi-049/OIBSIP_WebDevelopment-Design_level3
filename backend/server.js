// server.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { initSocket } = require('./socket/socket');
const startLowStockCron = require('./utils/cronJobs');

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Init Socket.IO
initSocket(server);

// Start cron jobs
startLowStockCron();

// CORS — allow both local dev and deployed frontend
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pizzas', require('./routes/pizza'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/inventory', require('./routes/inventory'));

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PizzaHub API Running 🍕'
  });
});

// TEST ROUTE — remove after debugging
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend updated successfully ✅',
    timestamp: new Date().toISOString(),
    env_check: {
      has_backend_url: !!process.env.BACKEND_URL,
      has_client_url: !!process.env.CLIENT_URL,
      backend_url: process.env.BACKEND_URL || 'NOT SET ❌',
      client_url: process.env.CLIENT_URL || 'NOT SET ❌',
      node_env: process.env.NODE_ENV
    }
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});