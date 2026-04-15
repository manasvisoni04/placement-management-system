const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Login Route
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Please provide email, password, and role' });
    }

    try {
        let user;
        if (role === 'admin') {
            user = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
        } else if (role === 'student') {
            user = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
        } else {
            return res.status(400).json({ error: 'Invalid role' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const payload = {
            id: role === 'admin' ? user.admin_id : user.student_id,
            email: user.email,
            role: role,
            name: role === 'student' ? user.name : 'Placement Admin'
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

        res.json({ token, user: payload });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Student Registration
router.post('/register', async (req, res) => {
    const { name, branch, cgpa, email, password } = req.body;

    if (!name || !branch || !cgpa || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existing = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
        if (existing) {
            return res.status(400).json({ error: 'Student already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO students (name, branch, cgpa, email, password) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(name, branch, parseFloat(cgpa), email, hashedPassword);
        
        // Auto-login after registration
        const payload = {
            id: result.lastInsertRowid,
            email: email,
            role: 'student',
            name: name
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
        res.status(201).json({ token, user: payload, message: 'Registration successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

module.exports = router;
