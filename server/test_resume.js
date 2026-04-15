const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Listen to console and network errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err));
    page.on('requestfailed', request => {
        console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to register...");
    await page.goto('http://localhost:5173/register');

    // Make an email with random string to avoid duplicate
    const uniqueEmail = `test_${Date.now()}@test.com`;

    console.log("Filling registration for", uniqueEmail);
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Puppeteer Student');
    await page.type('input[name="email"]', uniqueEmail);
    await page.type('input[name="password"]', 'password123');
    await page.type('input[name="confirmPassword"]', 'password123');
    await page.select('select[name="role"]', 'student');

    await page.click('button[type="submit"]');

    console.log("Waiting for dashboard to load...");
    // Wait for the Profile tab to be visible
    try {
        // Find the profile tab button (My Profile & Resume)
        await page.waitForFunction(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.some(b => b.textContent.includes('My Profile & Resume'));
        }, { timeout: 10000 });
        
        console.log("Dashboard loaded! Navigating to Profile tab...");
        
        const tabs = await page.$$('button');
        for (const tab of tabs) {
            const text = await page.evaluate(el => el.textContent, tab);
            if (text.includes('My Profile & Resume')) {
                await tab.click();
                break;
            }
        }
        
    } catch(err) {
        console.log("Failed to load or click profile tab:", err);
        // Maybe we are on login page?
        const currentUrl = page.url();
        console.log("Current URL:", currentUrl);
        await browser.close();
        return;
    }

    await new Promise(r => setTimeout(r, 1000));

    console.log("Clicking Edit Details...");
    try {
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const editBtn = buttons.find(b => b.textContent.includes('Edit Details'));
            if(editBtn) editBtn.click();
        });
    } catch(err) {
       console.log("Error finding edit details:", err);
    }
    
    await new Promise(r => setTimeout(r, 1000));

    console.log("Filling mandatory fields...");
    // Fill Roll No, Course, Batch
    await page.type('input[name="roll_no"]', 'DSXA-9999');
    
    // Select course
    await page.select('select[name="course"]', 'M.Tech. DS');
    
    await page.type('input[name="batch"]', '2026');

    // Create a dummy PDF file to upload
    const fs = require('fs');
    fs.writeFileSync('dummy_resume.pdf', 'Dummy PDF Content');
    
    console.log("Uploading file...");
    const inputUploadHandle = await page.$('input[type="file"]');
    if (inputUploadHandle) {
        await inputUploadHandle.uploadFile('dummy_resume.pdf');
    } else {
        console.log("File input NOT FOUND!");
    }

    await new Promise(r => setTimeout(r, 500));

    console.log("Clicking Save Profile Details...");
    try {
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const saveBtn = buttons.find(b => b.textContent.includes('Save Profile Details'));
            if(saveBtn) saveBtn.click();
        });
    } catch (e) {
        console.log(e);
    }

    console.log("Waiting 5 seconds to observe network/console logs...");
    await new Promise(r => setTimeout(r, 5000));

    console.log("Test finished. Closing browser.");
    await browser.close();
})();
