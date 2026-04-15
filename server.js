const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'placement_secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure: true in production with HTTPS
}));

// Global variable for views (e.g., checking if user is logged in)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.role = req.session.role || null;
    res.locals.successMsg = req.session.successMsg || null;
    res.locals.errorMsg = req.session.errorMsg || null;
    delete req.session.successMsg;
    delete req.session.errorMsg;
    next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

// Use Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);

// Root route redirects based on role
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (req.session.role === 'student') {
            return res.redirect('/student/dashboard');
        }
    }
    // Render landing page or redirect to login
    res.redirect('/auth/login');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
