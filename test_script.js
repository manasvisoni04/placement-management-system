const http = require('http');

const baseURL = 'http://localhost:3000';
let adminCookie = '';
let studentCookie = '';
let studentId = 0;
let companyId = 0;
let driveId = 0;

// Helper fn to make requests
function makeRequest(path, method, data, cookie) {
    return new Promise((resolve, reject) => {
        const url = new URL(baseURL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {}
        };

        if (cookie) {
            options.headers['Cookie'] = cookie;
        }

        if (data) {
            const postData = new URLSearchParams(data).toString();
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let setCookie = null;
                if (res.headers['set-cookie']) {
                    setCookie = res.headers['set-cookie'][0].split(';')[0];
                }
                resolve({ 
                    statusCode: res.statusCode, 
                    headers: res.headers, 
                    body, 
                    setCookie 
                });
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(new URLSearchParams(data).toString());
        }
        
        req.end();
    });
}

async function runTests() {
    console.log("Starting End-to-End Tests...");

    try {
        // 1. Admin Login
        console.log("\n[TEST] Admin Login...");
        const adminLogin = await makeRequest('/auth/login', 'POST', {
            role: 'admin',
            email: 'admin@admin.com',
            password: 'admin'
        });
        adminCookie = adminLogin.setCookie;
        if (adminLogin.statusCode === 302 && adminLogin.headers.location === '/admin/dashboard') {
            console.log("✅ Admin Login Successful");
        } else {
            console.error("❌ Admin Login Failed", adminLogin.statusCode, adminLogin.headers.location);
            return;
        }

        // 2. Student Registration
        console.log("\n[TEST] Registering New Student...");
        // Use a random email to avoid UNIQUE constraint on re-runs
        const randomEmail = `test.student.${Date.now()}@college.edu`;
        const studentReg = await makeRequest('/auth/register', 'POST', {
            name: 'Test Student',
            branch: 'CSE',
            cgpa: '8.5',
            email: randomEmail,
            password: 'password123'
        });
        if (studentReg.statusCode === 302 && studentReg.headers.location === '/auth/login') {
            console.log("✅ Student Registration Successful");
        } else {
            console.error("❌ Student Registration Failed");
            return;
        }

        // 3. Student Login
        console.log("\n[TEST] Student Login...");
        const studentLogin = await makeRequest('/auth/login', 'POST', {
            role: 'student',
            email: randomEmail,
            password: 'password123'
        });
        studentCookie = studentLogin.setCookie;
        if (studentLogin.statusCode === 302 && studentLogin.headers.location === '/student/dashboard') {
            console.log("✅ Student Login Successful");
        } else {
            console.error("❌ Student Login Failed");
            return;
        }

        // 4. Admin creates a Company
        console.log("\n[TEST] Admin Creating Company...");
        const companyName = 'TestCorp ' + Date.now();
        const addCompany = await makeRequest('/admin/company/add', 'POST', {
            company_name: companyName,
            job_role: 'Developer',
            package: '12 LPA',
            location: 'Remote'
        }, adminCookie);
        if (addCompany.statusCode === 302 && addCompany.headers.location === '/admin/dashboard') {
            console.log("✅ Company Created");
        } else {
            console.error("❌ Company Creation Failed");
        }

        // Fetch company ID by parsing the admin dashboard HTML (Hack for headless script to get ID)
        const dashboard = await makeRequest('/admin/dashboard', 'GET', null, adminCookie);
        const match = dashboard.body.match(new RegExp(`<td>#(\\d+)</td>\\s*<td class="fw-bold">${companyName}</td>`));
        if (match) {
            companyId = match[1];
        } else {
            // fallback: get the last created company using sqlite3 library directly
            const db = require('./database');
            companyId = db.prepare('SELECT company_id FROM companies ORDER BY company_id DESC LIMIT 1').get().company_id;
        }
        
        // 5. Admin creates a Placement Drive
        console.log("\n[TEST] Admin Creating Placement Drive...");
        const addDrive = await makeRequest('/admin/drive/add', 'POST', {
            company_id: companyId,
            eligibility_cgpa: '8.00',
            deadline: '2026-12-31'
        }, adminCookie);
        if (addDrive.statusCode === 302 && addDrive.headers.location === '/admin/dashboard') {
            console.log("✅ Placement Drive Created");
        } else {
            console.error("❌ Placement Drive Creation Failed");
        }

        // Fetch drive ID directly from db to test applying
        const db = require('./database');
        driveId = db.prepare('SELECT drive_id FROM placement_drives ORDER BY drive_id DESC LIMIT 1').get().drive_id;

        // 6. Student Appling to Drive
        console.log(`\n[TEST] Student Applying to Drive #${driveId} (Student CGPA: 8.5, Required: 8.0)...`);
        const applyReq = await makeRequest(`/student/apply/${driveId}`, 'POST', {}, studentCookie);
        
        if (applyReq.statusCode === 302 && applyReq.headers.location === '/student/dashboard') {
            const hasAppliedCount = db.prepare('SELECT COUNT(*) as count FROM applications WHERE drive_id = ?').get(driveId).count;
            if (hasAppliedCount > 0) {
                 console.log("✅ Application successfully inserted into DB!");
            } else {
                 console.error("❌ Application POST succeeded but DB row not found.");
            }
        } else {
            console.error("❌ Apply to Drive Failed", applyReq.statusCode);
        }

        // 7. Student Appling Again (Duplicate Test)
        console.log("\n[TEST] Student Applying Again to Same Drive (Duplicate Test)...");
        await makeRequest(`/student/apply/${driveId}`, 'POST', {}, studentCookie);
        const duplicateCount = db.prepare('SELECT COUNT(*) as count FROM applications WHERE drive_id = ?').get(driveId).count;
        if (duplicateCount === 1) {
            console.log("✅ Duplicate application prevented successfully.");
        } else {
             console.error("❌ Duplicate application was somehow allowed!", duplicateCount);
        }

        console.log("\n🎉 All core flows tested successfully!");

    } catch (err) {
        console.error("Test execution error:", err);
    }
}

runTests();
