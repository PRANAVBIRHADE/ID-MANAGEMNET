const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const exportRoutes = require('./routes/export');
const noticeRoutes = require('./routes/notices');
const importantDatesRoutes = require('./routes/importantDates');
const analyticsRoutes = require('./routes/analytics');
const securityRoutes = require('./routes/security');
const { initializeSocket } = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initializeSocket(server);

// CORS Configuration
const corsOptions = {
  origin: [
    'https://id-managemnet-sepia.vercel.app',
    'https://id-managemnet.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-id-management';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server running without database connection');
  });

// API Routes - Serve these BEFORE static files
console.log('🔧 Setting up API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/important-dates', importantDatesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/security', securityRoutes);

// Static files - Serve these AFTER API routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Student ID Management API running');
});

// Debug endpoint to test API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working!', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
}); 