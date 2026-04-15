const nodemailer = require('nodemailer');

// Async function to send a confirmation email
async function sendConfirmationEmail(studentEmail, studentName, companyName, jobRole) {
  try {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await transporter.sendMail({
      from: '"Training & Placement Cell" <tpc@university.edu>', // sender
      to: studentEmail, 
      subject: `Application Confirmed: ${companyName}`, 
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Application Successful!</h2>
          </div>
          <div style="padding: 20px;">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>This is to confirm that your application for the <strong>${jobRole}</strong> position at <strong>${companyName}</strong> has been successfully received by the Training and Placement Cell.</p>
            <p>We will notify you soon regarding any further updates such as shortlisting and rounds of procedure.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Training & Placement Cell</strong></p>
          </div>
        </div>
      `, 
    });

    console.log("Confirmation email sent to:", studentEmail);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

async function sendApplicationStatusEmail(studentEmail, studentName, companyName, jobRole, status) {
  try {
    let testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const isAccepted = status === 'Accepted';
    const bgColor = isAccepted ? '#10b981' : '#ef4444';

    const info = await transporter.sendMail({
      from: '"Training & Placement Cell" <tpc@university.edu>',
      to: studentEmail, 
      subject: `Application ${status}: ${companyName}`, 
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${bgColor}; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Application ${status}</h2>
          </div>
          <div style="padding: 20px;">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>This is to inform you that your application for the <strong>${jobRole}</strong> position at <strong>${companyName}</strong> has been <strong>${status.toLowerCase()}</strong> by the placement cell.</p>
            ${isAccepted ? '<p>Congratulations! We will notify you of the next round soon.</p>' : '<p>Don\'t be discouraged. Keep applying to other drives that match your profile!</p>'}
            <br/>
            <p>Best Regards,</p>
            <p><strong>Training & Placement Cell</strong></p>
          </div>
        </div>
      `, 
    });
    console.log("Status email sent to:", studentEmail);
  } catch (error) {
    console.error("Error sending status email:", error);
  }
}

module.exports = {
  sendConfirmationEmail,
  sendApplicationStatusEmail
};
