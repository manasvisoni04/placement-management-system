const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, authAdmin } = require('../middleware/auth');

// Apply middleware to all routes
router.use(authMiddleware, authAdmin);

// Get Dashboard Stats & Lists
router.get('/dashboard', (req, res) => {
    try {
        const companies = db.prepare('SELECT * FROM companies').all();
        const students = db.prepare('SELECT student_id, name, branch, cgpa, email, skills, resume_url, certifications, experience, roll_no, enrollment_no, department, course, batch, linkedin_url, github_url FROM students').all();
        const drives = db.prepare(`
            SELECT d.*, c.company_name, 
            (SELECT COUNT(*) FROM applications WHERE drive_id = d.drive_id) as applicant_count
            FROM placement_drives d 
            JOIN companies c ON d.company_id = c.company_id
            ORDER BY d.deadline DESC
        `).all();
        const notifications = db.prepare('SELECT * FROM notifications ORDER BY date DESC').all();
        const skills = db.prepare(`
            SELECT s.*, c.company_name 
            FROM skills_required s
            JOIN companies c ON s.company_id = c.company_id
        `).all();
        const applications = db.prepare(`
            SELECT a.*, s.name as student_name, s.branch, s.cgpa, s.email, s.skills, s.certifications, s.experience, s.resume_url, s.github_url, s.linkedin_url, d.company_id, c.company_name, c.job_role
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN placement_drives d ON a.drive_id = d.drive_id
            JOIN companies c ON d.company_id = c.company_id
            ORDER BY a.applied_on DESC
        `).all();
        const queries = db.prepare(`
            SELECT q.*, s.name as student_name, s.branch, s.roll_no
            FROM queries q
            JOIN students s ON q.student_id = s.student_id
            ORDER BY q.created_at DESC
        `).all();

        res.json({
            stats: {
                totalCompanies: companies.length,
                totalStudents: students.length,
                totalDrives: drives.length,
                totalNotifications: notifications.length,
                totalApplications: applications.length
            },
            companies,
            students,
            drives,
            notifications,
            skills,
            applications,
            queries
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Update Application Status & Send Notifications
router.put('/applications/:id/status', (req, res) => {
    const { status } = req.body;
    try {
        db.prepare('UPDATE applications SET status = ? WHERE application_id = ?').run(status, req.params.id);
        
        // Fetch details to send email
        const appDetails = db.prepare(`
            SELECT s.email, s.name, c.company_name, c.job_role 
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN placement_drives d ON a.drive_id = d.drive_id
            JOIN companies c ON d.company_id = c.company_id
            WHERE a.application_id = ?
        `).get(req.params.id);

        if (appDetails && (status === 'Accepted' || status === 'Rejected')) {
            const { sendApplicationStatusEmail } = require('./mailer');
            sendApplicationStatusEmail(appDetails.email, appDetails.name, appDetails.company_name, appDetails.job_role, status);
        }

        res.json({ message: 'Application status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// Company Management
router.post('/companies', (req, res) => {
    const { company_name, job_role, package, location } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO companies (company_name, job_role, package, location) VALUES (?, ?, ?, ?)');
        const result = stmt.run(company_name, job_role, package, location);
        res.json({ message: 'Company added successfully', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Error adding company' });
    }
});

router.delete('/companies/:id', (req, res) => {
    try {
        const id = req.params.id;
        const deleteTransaction = db.transaction(() => {
            const drives = db.prepare('SELECT drive_id FROM placement_drives WHERE company_id = ?').all(id);
            for (const d of drives) {
                db.prepare('DELETE FROM applications WHERE drive_id = ?').run(d.drive_id);
            }
            db.prepare('DELETE FROM placement_drives WHERE company_id = ?').run(id);
            db.prepare('DELETE FROM skills_required WHERE company_id = ?').run(id);
            db.prepare('DELETE FROM companies WHERE company_id = ?').run(id);
        });
        deleteTransaction();
        res.json({ message: 'Company and its dependencies deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete company and dependencies' });
    }
});

// Skills Management
router.post('/skills', (req, res) => {
    const { company_id, skill_name } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO skills_required (company_id, skill_name) VALUES (?, ?)');
        const result = stmt.run(company_id, skill_name);
        res.json({ message: 'Skill added successfully', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Error adding skill' });
    }
});

router.delete('/skills/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM skills_required WHERE skill_id = ?').run(req.params.id);
        res.json({ message: 'Skill deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting skill' });
    }
});

// Drives Management
router.post('/drives', (req, res) => {
    const { company_id, eligibility_cgpa, deadline, timing, venue, rounds_of_procedure, eligible_courses, eligible_branches } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO placement_drives (company_id, eligibility_cgpa, deadline, timing, venue, rounds_of_procedure, eligible_courses, eligible_branches) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(company_id, eligibility_cgpa, deadline, timing || 'TBD', venue || 'TBD', rounds_of_procedure || 'Not specified', eligible_courses || 'All', eligible_branches || 'All');
        res.json({ message: 'Drive created successfully', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Error creating placement drive' });
    }
});

router.put('/drives/:id/status', (req, res) => {
    const { status } = req.body; // 'Open' or 'Closed'
    try {
        db.prepare('UPDATE placement_drives SET status = ? WHERE drive_id = ?').run(status, req.params.id);
        res.json({ message: 'Drive status updated' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating status' });
    }
});

// Notifications Management
router.post('/notifications', (req, res) => {
    const { message } = req.body;
    const date = new Date().toISOString().split('T')[0];
    try {
        const stmt = db.prepare('INSERT INTO notifications (message, date) VALUES (?, ?)');
        const result = stmt.run(message, date);
        res.json({ message: 'Notification posted successfully', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Error posting notification' });
    }
});

router.delete('/notifications/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM notifications WHERE notification_id = ?').run(req.params.id);
        res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting notification' });
    }
});

router.delete('/drives/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM placement_drives WHERE drive_id = ?').run(req.params.id);
        res.json({ message: 'Drive deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting placement drive' });
    }
});

// Queries Management
router.post('/queries/:id/reply', (req, res) => {
    const queryId = req.params.id;
    const { reply } = req.body;
    try {
        db.prepare("UPDATE queries SET reply = ?, status = 'Answered' WHERE query_id = ?").run(reply, queryId);
        res.json({ message: 'Reply sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send reply' });
    }
});

module.exports = router;
