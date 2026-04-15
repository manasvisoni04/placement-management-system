const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to protect admin routes
router.use((req, res, next) => {
    if (!req.session.user || req.session.role !== 'admin') {
        req.session.errorMsg = 'Access Denied. Please login as Admin.';
        return res.redirect('/auth/login');
    }
    next();
});

// Admin Dashboard
router.get('/dashboard', (req, res) => {
    // Fetch all data for the dashboard
    const companies = db.prepare('SELECT * FROM companies').all();
    const students = db.prepare('SELECT * FROM students').all();
    const drives = db.prepare(`
        SELECT d.*, c.company_name 
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

    res.render('admin/dashboard', { 
        companies, 
        students, 
        drives, 
        notifications,
        skills
    });
});

// Add Company
router.post('/company/add', (req, res) => {
    const { company_name, job_role, package, location } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO companies (company_name, job_role, package, location) VALUES (?, ?, ?, ?)');
        stmt.run(company_name, job_role, package, location);
        req.session.successMsg = 'Company added successfully!';
    } catch (err) {
        req.session.errorMsg = 'Error adding company.';
    }
    res.redirect('/admin/dashboard');
});

// Delete Company
router.post('/company/delete/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM companies WHERE company_id = ?').run(req.params.id);
        req.session.successMsg = 'Company deleted successfully!';
    } catch (err) {
        req.session.errorMsg = 'Error deleting company.';
    }
    res.redirect('/admin/dashboard');
});

// Add Skill Requirement
router.post('/skill/add', (req, res) => {
    const { company_id, skill_name } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO skills_required (company_id, skill_name) VALUES (?, ?)');
        stmt.run(company_id, skill_name);
        req.session.successMsg = 'Skill added to company successfully!';
    } catch (err) {
        req.session.errorMsg = 'Error adding skill.';
    }
    res.redirect('/admin/dashboard');
});

// Add Placement Drive
router.post('/drive/add', (req, res) => {
    const { company_id, eligibility_cgpa, deadline, timing, venue, rounds_of_procedure } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO placement_drives (company_id, eligibility_cgpa, deadline, timing, venue, rounds_of_procedure) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(company_id, eligibility_cgpa, deadline, timing || 'TBD', venue || 'TBD', rounds_of_procedure || 'Not specified');
        req.session.successMsg = 'Placement drive created successfully!';
    } catch (err) {
        req.session.errorMsg = 'Error creating placement drive.';
    }
    res.redirect('/admin/dashboard');
});

// Update Drive Status
router.post('/drive/status/:id', (req, res) => {
    const { status } = req.body;
    try {
        db.prepare('UPDATE placement_drives SET status = ? WHERE drive_id = ?').run(status, req.params.id);
        req.session.successMsg = 'Drive status updated!';
    } catch (err) {
        req.session.errorMsg = 'Error updating status.';
    }
    res.redirect('/admin/dashboard');
});

// Add Notification
router.post('/notification/add', (req, res) => {
    const { message } = req.body;
    const date = new Date().toISOString().split('T')[0];
    try {
        const stmt = db.prepare('INSERT INTO notifications (message, date) VALUES (?, ?)');
        stmt.run(message, date);
        req.session.successMsg = 'Notification posted successfully!';
    } catch (err) {
        req.session.errorMsg = 'Error posting notification.';
    }
    res.redirect('/admin/dashboard');
});

// Delete Placement Drive
router.post('/drive/delete/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM placement_drives WHERE drive_id = ?').run(req.params.id);
        req.session.successMsg = 'Drive deleted successfully!';
    } catch (err) {
        req.session.errorMsg = 'Error deleting placement drive.';
    }
    res.redirect('/admin/dashboard');
});

module.exports = router;
