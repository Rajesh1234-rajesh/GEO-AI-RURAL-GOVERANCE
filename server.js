require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

const app = express();

// Connect to MongoDB & initialize default AP governance records
connectDB().then(() => {
  const initData = require('./src/config/initData');
  initData();
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/complaints', require('./src/routes/complaints'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/map', require('./src/routes/map'));
app.use('/api/schemes', require('./src/routes/schemes'));
app.use('/api/government-teams', require('./src/routes/teams'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/analytics', require('./src/routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GeoAI Rural Platform API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌿 GeoAI Rural Platform Backend running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Base: http://localhost:${PORT}/api\n`);
});

module.exports = app;
