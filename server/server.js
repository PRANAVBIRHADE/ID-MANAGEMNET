const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(express.static(path.join(__dirname, 'public')));


//app.get(/^((?!\/api\/).)*$/, (req, res) => {
//  res.sendFile(path.join(__dirname, 'public', 'index.html'));
//});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/important-dates', importantDatesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/security', securityRoutes);

console.log('Server running without database for now');

app.get('/', (req, res) => {
  res.send('Student ID Management API running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 