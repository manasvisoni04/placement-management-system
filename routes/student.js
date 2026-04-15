const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to protect student routes
router.use((req, res, next) => {
    if (!req.session.user || req.session.role !== 'student') {
        req.session.errorMsg = 'Access Denied. Please login as Student.';
        return res.redirect('/auth/login');
    }
    next();
});

// Student Dashboard
router.get('/dashboard', (req, res) => {
    // Fetch student info
    const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(req.session.user.id);

    // Fetch notifications
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY date DESC').all();

    // Fetch placement drives with company and skills info
    const drives = db.prepare(`
        SELECT d.*, c.company_name, c.job_role, c.package, c.location
        FROM placement_drives d
        JOIN companies c ON d.company_id = c.company_id
        ORDER BY d.deadline ASC
    `).all();

    // Map skills to each company
    const skillsList = db.prepare('SELECT * FROM skills_required').all();

    // Fetch applications for this student
    const applications = db.prepare('SELECT drive_id FROM applications WHERE student_id = ?').all(req.session.user.id);
    const appliedDriveIds = applications.map(a => a.drive_id);

    drives.forEach(drive => {
        drive.skills = skillsList
            .filter(s => s.company_id === drive.company_id)
            .map(s => s.skill_name);
        
        // Eligibility Check
        drive.isEligible = student.cgpa >= drive.eligibility_cgpa;
        // Application Check
        drive.hasApplied = appliedDriveIds.includes(drive.drive_id);
    });

    res.render('student/dashboard', { 
        student, 
        notifications, 
        drives 
    });
});

// Apply to Drive
router.post('/apply/:drive_id', (req, res) => {
    const driveId = req.params.drive_id;
    const studentId = req.session.user.id;
    const date = new Date().toISOString().split('T')[0];

    try {
        // Double check eligibility
        const student = db.prepare('SELECT cgpa FROM students WHERE student_id = ?').get(studentId);
        const drive = db.prepare('SELECT eligibility_cgpa, status FROM placement_drives WHERE drive_id = ?').get(driveId);

        if (drive.status === 'Closed') {
            req.session.errorMsg = 'This drive is closed.';
            return res.redirect('/student/dashboard');
        }

        if (student.cgpa < drive.eligibility_cgpa) {
            req.session.errorMsg = 'You do not meet the CGPA eligibility for this drive.';
            return res.redirect('/student/dashboard');
        }

        const stmt = db.prepare('INSERT INTO applications (student_id, drive_id, applied_on) VALUES (?, ?, ?)');
        stmt.run(studentId, driveId, date);
        req.session.successMsg = 'Successfully applied to the placement drive!';
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            req.session.errorMsg = 'You have already applied to this drive.';
        } else {
            req.session.errorMsg = 'Error applying to drive.';
        }
    }
    res.redirect('/student/dashboard');
});

module.exports = router;
