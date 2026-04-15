async function test() {
  try {
    console.log("1. Authenticating Admin...");
    const adminRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin.com', password: 'admin', role: 'admin' })
    });
    const adminToken = (await adminRes.json()).token;

    console.log("2. Creating Drive...");
    const driveRes = await fetch('http://localhost:5000/api/admin/drives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
      body: JSON.stringify({
        company_id: 1, // Assume company 1 exists
        eligibility_cgpa: '7.5',
        timing: '10 AM',
        venue: 'Auditorium',
        rounds_of_procedure: 'Test',
        eligible_courses: 'All',
        eligible_branches: 'All',
        deadline: '2026-12-31'
      })
    });
    const driveData = await driveRes.json();
    const driveId = driveData.id;
    console.log("Drive ID created:", driveId);

    console.log("3. Fetching student token (assuming students exist)...");
    const db = require('better-sqlite3')('placement.db');
    const student = db.prepare('SELECT * FROM students LIMIT 1').get();
    if (!student) throw Error('No students found');
    
    const jwt = require('jsonwebtoken');
    const studentToken = jwt.sign({ id: student.student_id, email: student.email, role: 'student', name: student.name }, 'sdsf_placement_secret_key_2025_secure', { expiresIn: '12h' });

    console.log("4. Applying to Drive...");
    const applyRes = await fetch('http://localhost:5000/api/student/apply/' + driveId, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + studentToken }
    });
    console.log("Apply response:", await applyRes.json());

    const app = db.prepare('SELECT application_id FROM applications WHERE drive_id = ?').get(driveId);
    console.log("Application created with ID:", app.application_id);

    console.log("5. Testing Accept on application...");
    const acceptRes = await fetch('http://localhost:5000/api/admin/applications/' + app.application_id + '/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
      body: JSON.stringify({ status: 'Accepted' })
    });
    const acceptData = await acceptRes.json();
    console.log("Accept status code:", acceptRes.status);
    console.log("Accept response data:", acceptData);
    
    const finalCheck = db.prepare('SELECT status FROM applications WHERE application_id = ?').get(app.application_id);
    console.log("FINAL DB STATUS:", finalCheck.status);

  } catch (err) {
    console.error('End-to-End Test Error:', err.message);
  }
}
test();
