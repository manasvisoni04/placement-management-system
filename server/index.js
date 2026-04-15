require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

// Middleware
app.use(cors()); // Allow React client to connect
app.use(express.json()); // Parse JSON requests
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const auths = require('./routes/auths');
const adminApi = require('./routes/adminApi');
const studentApi = require('./routes/studentApi');

app.use('/api/auth', auths);
app.use('/api/admin', adminApi);
app.use('/api/student', studentApi);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Placement API is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});
