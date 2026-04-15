async function test() {
  try {
    const db = require('better-sqlite3')('placement.db');
    // Get student that has an Accepted application
    const app = db.prepare("SELECT student_id FROM applications WHERE status = 'Accepted' OR status = 'Rejected' LIMIT 1").get();
    if (!app) { console.log("NO ACCEPTED/REJECTED APPLICATIONS"); return; }
    
    const student = db.prepare("SELECT * FROM students WHERE student_id = ?").get(app.student_id);
    console.log("Testing with student:", student.email);

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: student.student_id, email: student.email, name: student.name, role: 'student'}, 'sdsf_placement_secret_key_2025_secure', { expiresIn: '12h' });

    const res = await fetch('http://localhost:5000/api/student/dashboard', { headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json();
    
    console.log("Personal Notifications:", data.personalNotifications);
    console.log("Drives (hasApplied & status):", data.drives.map(d => ({id: d.drive_id, applied: d.hasApplied, status: d.applicationStatus})).filter(d => d.applied));
  } catch(e) { console.error('Error', e) }
}
test();
