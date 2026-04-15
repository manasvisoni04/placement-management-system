const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');

// Render Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Render Registration Page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Handle Login Form
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        req.session.errorMsg = 'All fields are required.';
        return res.redirect('/auth/login');
    }

    try {
        let user;
        if (role === 'admin') {
            const stmt = db.prepare('SELECT * FROM admins WHERE email = ?');
            user = stmt.get(email);
        } else if (role === 'student') {
            const stmt = db.prepare('SELECT * FROM students WHERE email = ?');
            user = stmt.get(email);
        } else {
            req.session.errorMsg = 'Invalid role selected.';
            return res.redirect('/auth/login');
        }

        if (!user) {
            req.session.errorMsg = 'Invalid email or password.';
            return res.redirect('/auth/login');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.session.errorMsg = 'Invalid email or password.';
            return res.redirect('/auth/login');
        }

        // Setup session
        req.session.user = {
            id: role === 'admin' ? user.admin_id : user.student_id,
            email: user.email,
            name: role === 'student' ? user.name : 'Admin'
        };
        req.session.role = role;

        if (role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/student/dashboard');
        }
    } catch (err) {
        console.error(err);
        req.session.errorMsg = 'Server error occurred.';
        return res.redirect('/auth/login');
    }
});

// Handle Student Registration Form
router.post('/register', async (req, res) => {
    const { name, branch, cgpa, email, password } = req.body;

    if (!name || !branch || !cgpa || !email || !password) {
        req.session.errorMsg = 'All fields are required for registration.';
        return res.redirect('/auth/register');
    }

    try {
        // Check if student exists
        const checkUser = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
        if (checkUser) {
            req.session.errorMsg = 'Email is already registered.';
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertStudent = db.prepare('INSERT INTO students (name, branch, cgpa, email, password) VALUES (?, ?, ?, ?, ?)');
        insertStudent.run(name, branch, parseFloat(cgpa), email, hashedPassword);

        req.session.successMsg = 'Registration successful! You can now login.';
        return res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.session.errorMsg = 'Error during registration. Please try again.';
        return res.redirect('/auth/register');
    }
});

// Handle Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
