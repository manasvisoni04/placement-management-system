const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'placement.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      student_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      branch TEXT NOT NULL,
      cgpa REAL NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      skills TEXT
    );

    CREATE TABLE IF NOT EXISTS companies (
      company_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      job_role TEXT NOT NULL,
      package TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS placement_drives (
      drive_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      eligibility_cgpa REAL NOT NULL,
      deadline TEXT NOT NULL,
      timing TEXT DEFAULT 'TBD',
      venue TEXT DEFAULT 'TBD',
      rounds_of_procedure TEXT DEFAULT 'Not specified',
      status TEXT CHECK(status IN ('Open', 'Closed')) DEFAULT 'Open',
      FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills_required (
      skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      skill_name TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      application_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      drive_id INTEGER NOT NULL,
      applied_on TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (drive_id) REFERENCES placement_drives(drive_id) ON DELETE CASCADE,
      UNIQUE(student_id, drive_id)
    );

    CREATE TABLE IF NOT EXISTS queries (
      query_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      reply TEXT,
      status TEXT CHECK(status IN ('Pending', 'Answered')) DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
  `);

  // Migration scripts to dynamically add columns if they don't exist
  try { db.exec("ALTER TABLE placement_drives ADD COLUMN timing TEXT DEFAULT 'TBD';"); } catch (e) { /* ignore if column exists */ }
  try { db.exec("ALTER TABLE placement_drives ADD COLUMN venue TEXT DEFAULT 'TBD';"); } catch (e) { /* ignore if column exists */ }
  try { db.exec("ALTER TABLE placement_drives ADD COLUMN rounds_of_procedure TEXT DEFAULT 'Not specified';"); } catch (e) { /* ignore if column exists */ }
  
  // Student Profile Migration Scripts
  try { db.exec("ALTER TABLE students ADD COLUMN resume_url TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN certifications TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN experience TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN roll_no TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN enrollment_no TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN department TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN course TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN batch TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN linkedin_url TEXT;"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE students ADD COLUMN github_url TEXT;"); } catch (e) { /* ignore */ }
  
  // Placement Drive Eligibility Migrations
  try { db.exec("ALTER TABLE placement_drives ADD COLUMN eligible_courses TEXT DEFAULT 'All';"); } catch (e) { /* ignore */ }
  try { db.exec("ALTER TABLE placement_drives ADD COLUMN eligible_branches TEXT DEFAULT 'All';"); } catch (e) { /* ignore */ }

  // Applications Status Migration
  try { db.exec("ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'Pending';"); } catch (e) { /* ignore */ }

  // Seed default Admin if not exists
  const adminQuery = db.prepare('SELECT count(*) as count FROM admins WHERE email = ?');
  const adminExists = adminQuery.get('admin@admin.com').count > 0;

  if (!adminExists) {
    const defaultPassword = 'admin'; // For testing purpose
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    const insertAdmin = db.prepare('INSERT INTO admins (email, password) VALUES (?, ?)');
    insertAdmin.run('admin@admin.com', hashedPassword);
    console.log('Default admin seeded. Email: admin@admin.com, Password: admin');
  } else {
    console.log('Admin already exists.');
  }
}

initDb();

module.exports = db;
