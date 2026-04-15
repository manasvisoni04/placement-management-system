async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin',
        role: 'admin'
      })
    });
    
    if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.statusText);
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful');

    const db = require('better-sqlite3')('placement.db');
    const apps = db.prepare('SELECT application_id FROM applications LIMIT 1').get();
    
    if (!apps) {
      console.log('No applications in DB to test!');
      return;
    }

    const appId = apps.application_id;
    console.log('Testing Accept endpoint for App ID:', appId);
    
    const res = await fetch('http://localhost:5000/api/admin/applications/' + appId + '/status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ status: 'Accepted' })
    });
    
    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
