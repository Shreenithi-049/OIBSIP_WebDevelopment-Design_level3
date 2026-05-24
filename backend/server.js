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

// Connect DB
connectDB();

// Init Socket.IO
initSocket(server);

// Start cron jobs
startLowStockCron();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pizzas', require('./routes/pizza'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/inventory', require('./routes/inventory'));

app.get('/', (req, res) => res.json({ message: 'PizzaHub API Running 🍕' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
