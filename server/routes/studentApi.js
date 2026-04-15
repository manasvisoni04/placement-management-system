const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, authStudent } = require('../middleware/auth');
const { sendConfirmationEmail } = require('./mailer');

// Apply middleware to all routes
router.use(authMiddleware, authStudent);

// ----------------------------
// GET STUDENT DASHBOARD
// ----------------------------
router.get('/dashboard', (req, res) => {
    try {
        const studentId = req.user.id;

        const student = db.prepare(`
            SELECT student_id, name, branch, cgpa, email, skills, resume_url,
                   certifications, experience, roll_no, enrollment_no,
                   department, course, batch, linkedin_url, github_url
            FROM students WHERE student_id = ?
        `).get(studentId);

        const notifications = db.prepare(`
            SELECT * FROM notifications ORDER BY date DESC
        `).all();

        const today = new Date().toISOString().split('T')[0];

        const drives = db.prepare(`
            SELECT d.*, c.company_name, c.job_role, c.package, c.location
            FROM placement_drives d
            JOIN companies c ON d.company_id = c.company_id
            WHERE d.status = 'Open' AND d.deadline >= ?
            ORDER BY d.deadline ASC
        `).all(today);

        const skillsList = db.prepare(`SELECT * FROM skills_required`).all();

        const queries = db.prepare(`
            SELECT * FROM queries WHERE student_id = ? ORDER BY created_at DESC
        `).all(studentId);

        const applications = db.prepare(`
            SELECT a.drive_id, a.status, c.company_name, c.job_role, a.applied_on
            FROM applications a
            JOIN placement_drives d ON a.drive_id = d.drive_id
            JOIN companies c ON d.company_id = c.company_id
            WHERE a.student_id = ?
        `).all(studentId);

        const enrichedDrives = drives.map(drive => {
            const driveSkills = skillsList
                .filter(s => s.company_id === drive.company_id)
                .map(s => s.skill_name);

            const myApp = applications.find(a => a.drive_id === drive.drive_id);

            return {
                ...drive,
                skills: driveSkills,
                isEligible: student.cgpa >= drive.eligibility_cgpa,
                hasApplied: !!myApp,
                applicationStatus: myApp ? myApp.status : null
            };
        });

        const personalNotifications = applications
            .filter(app => app.status === 'Accepted' || app.status === 'Rejected')
            .map((app, idx) => ({
                id: `pn_${idx}`,
                message: `Update: You are ${app.status.toUpperCase()} for ${app.job_role} at ${app.company_name}.`,
                date: app.applied_on,
                type: app.status
            }));

        res.json({
            student,
            notifications,
            personalNotifications,
            drives: enrichedDrives,
            queries
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// ----------------------------
// APPLY TO DRIVE
// ----------------------------
router.post('/apply/:drive_id', (req, res) => {
    const driveId = req.params.drive_id;
    const studentId = req.user.id;
    const date = new Date().toISOString().split('T')[0];

    try {
        const student = db.prepare(`
            SELECT name, cgpa, email FROM students WHERE student_id = ?
        `).get(studentId);

        const drive = db.prepare(`
            SELECT pd.eligibility_cgpa, pd.status, c.company_name, c.job_role 
            FROM placement_drives pd
            JOIN companies c ON pd.company_id = c.company_id
            WHERE pd.drive_id = ?
        `).get(driveId);

        if (!drive) return res.status(404).json({ error: 'Drive not found' });
        if (drive.status === 'Closed')
            return res.status(400).json({ error: 'Drive is closed' });

        if (student.cgpa < drive.eligibility_cgpa)
            return res.status(400).json({ error: 'Not eligible (CGPA too low)' });

        db.prepare(`
            INSERT INTO applications (student_id, drive_id, applied_on)
            VALUES (?, ?, ?)
        `).run(studentId, driveId, date);

        sendConfirmationEmail(
            student.email,
            student.name,
            drive.company_name,
            drive.job_role
        );

        res.status(201).json({ message: 'Applied successfully!' });

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Already applied' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ----------------------------
// UPDATE PROFILE (NO FILE UPLOAD)
// ----------------------------
router.post('/profile', (req, res) => {
    try {
        const studentId = req.user.id;

        const {
            skills,
            certifications,
            experience,
            roll_no,
            enrollment_no,
            department,
            course,
            batch,
            linkedin_url,
            github_url,
            resume_url   // 👈 Google Drive link
        } = req.body;

        let updateQuery = `
            UPDATE students 
            SET skills = ?, certifications = ?, experience = ?,
                roll_no = ?, enrollment_no = ?, department = ?,
                course = ?, batch = ?, linkedin_url = ?, github_url = ?
        `;

        const params = [
            skills || '',
            certifications || '',
            experience || '',
            roll_no || null,
            enrollment_no || null,
            department || null,
            course || null,
            batch || null,
            linkedin_url || '',
            github_url || ''
        ];

        if (resume_url) {
            updateQuery += ', resume_url = ?';
            params.push(resume_url);
        }

        updateQuery += ' WHERE student_id = ?';
        params.push(studentId);

        db.prepare(updateQuery).run(...params);

        res.json({ message: 'Profile updated successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ----------------------------
// DELETE PROFILE
// ----------------------------
router.delete('/profile', (req, res) => {
    try {
        const studentId = req.user.id;
        db.prepare('DELETE FROM students WHERE student_id = ?').run(studentId);
        res.json({ message: 'Account deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// ----------------------------
// SUBMIT QUERY
// ----------------------------
router.post('/queries', (req, res) => {
    const studentId = req.user.id;
    const { subject, message } = req.body;

    try {
        db.prepare(`
            INSERT INTO queries (student_id, subject, message)
            VALUES (?, ?, ?)
        `).run(studentId, subject, message);

        res.json({ message: 'Query submitted' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit query' });
    }
});

module.exports = router;