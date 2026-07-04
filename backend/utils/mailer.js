const nodemailer = require("nodemailer");
const dayjs = require("dayjs");

let transporter = null;

/**
 * Initializes or retrieves the mail transporter.
 * If SMTP settings are provided in process.env, it uses them.
 * Otherwise, it creates a test account using nodemailer.createTestAccount()
 * so it works seamlessly out-of-the-box in development.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
    console.log(`[Mailer] ✓ Production SMTP configured: ${host}:${port}`);
  } else {
    // Development fallback: Ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("[Mailer] ✓ Dev SMTP configured (Ethereal test account):");
      console.log(`  User: ${testAccount.user}`);
      console.log(`  Pass: ${testAccount.pass}`);
    } catch (err) {
      console.error("[Mailer] ✗ Failed to configure Ethereal Dev SMTP:", err.message);
      // Create a null transporter that just logs to console
      transporter = {
        sendMail: async (options) => {
          console.log("[Mailer] [SIMULATION] Sending email to:", options.to);
          return { messageId: "simulated-id" };
        },
      };
    }
  }

  return transporter;
}

/**
 * Sends a generic HTML email wrapped in the MedConsult brand.
 */
async function sendEmail({ to, subject, title, body }) {
  try {
    const client = await getTransporter();
    const html = `
      <div style="background-color: #FDFBF7; padding: 40px 20px; font-family: 'Lato', 'Helvetica', sans-serif; color: #1C2B2D;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E6DFD3; border-top: 5px solid #3A6B4A; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(28,43,45,0.05);">
          <!-- Header -->
          <div style="background-color: #1C2B2D; padding: 30px; text-align: center; border-bottom: 1px solid #E6DFD3;">
            <h1 style="color: #E6DFD3; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; letter-spacing: 0.1em;">MEDCONSULT</h1>
            <p style="color: #9BA4A5; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;">Est. MCMXCVIII</p>
          </div>
          <!-- Body -->
          <div style="padding: 40px 30px; line-height: 1.6;">
            <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; margin-top: 0; margin-bottom: 20px; color: #1C2B2D; border-bottom: 1px solid #F3ECE1; padding-bottom: 10px;">${title}</h2>
            <div style="font-size: 15px; color: #4A4A4A;">
              ${body}
            </div>
            <div style="margin-top: 35px; border-top: 1px solid #F3ECE1; padding-top: 20px; font-size: 12px; color: #9BA4A5; text-align: center;">
              This is an automated alert from MedConsult Platform. Please do not reply directly to this email.
            </div>
          </div>
        </div>
      </div>
    `;

    const info = await client.sendMail({
      from: '"MedConsult Alerts" <alerts@medconsult.com>',
      to,
      subject,
      html,
    });

    console.log(`[Mailer] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    
    // If it is ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Mailer] Dev Preview URL: ${previewUrl}`);
    }
    return true;
  } catch (err) {
    console.error("[Mailer] ✗ Error sending email:", err.message);
    return false;
  }
}

/**
 * Simulates SMS alerts by logging to the console and environment.
 */
function sendSMSLog(phoneNumber, message) {
  const logStr = `\n==================================================\n` +
                 `[SMS ALERT REMINDER]\n` +
                 `To: ${phoneNumber || "Patient"}\n` +
                 `Message: ${message}\n` +
                 `Timestamp: ${new Date().toISOString()}\n` +
                 `==================================================\n`;
  console.log(logStr);
}

/**
 * Welcome Email Trigger
 */
async function sendWelcomeEmail(user) {
  const subject = "Welcome to MedConsult!";
  const title = `Welcome, ${user.name}!`;
  const body = `
    <p>Thank you for registering an account with <strong>MedConsult</strong>. We are dedicated to providing you with premium, verified healthcare access.</p>
    <p>Here are a few quick tips to get started:</p>
    <ul>
      <li><strong>Find Doctors:</strong> Search and filter through our panel of approved, licensed medical specialists.</li>
      <li><strong>Manage Appointments:</strong> Easily choose dates and time slots, keep track of bookings, and upload medical records securely.</li>
      <li><strong>Stay Updated:</strong> You will receive automated alerts via email/SMS for all appointment changes.</li>
    </ul>
    <p style="margin-top: 25px;">Should you require any assistance, please feel free to reach out to our platform administrators.</p>
  `;
  await sendEmail({ to: user.email, subject, title, body });
  
  if (user.phone) {
    sendSMSLog(user.phone, `Welcome to MedConsult, ${user.name}! Your account registration was successful.`);
  }
}

/**
 * Appointment Alerts Trigger
 */
async function sendAppointmentEmail(user, doctorUser, appointment, type) {
  let subject = "";
  let title = "";
  let body = "";
  let smsMessage = "";

  const formattedDate = dayjs(appointment.date).format("dddd, DD MMMM YYYY");
  const time = appointment.timeSlot;

  switch (type) {
    case "booked":
      subject = "Appointment Requested — MedConsult";
      title = "New Appointment Request Received";
      body = `
        <p>Dear ${user.name},</p>
        <p>Your appointment request with <strong>Dr. ${doctorUser.name}</strong> has been successfully received and is now pending confirmation.</p>
        <div style="background-color: #FDFBF7; border: 1px solid #E6DFD3; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <strong>Appointment Details:</strong><br/>
          • Doctor: Dr. ${doctorUser.name}<br/>
          • Date: ${formattedDate}<br/>
          • Time: ${time}<br/>
          • Status: Pending Doctor Approval
        </div>
        <p>You will receive another automated notification once your doctor reviews the request.</p>
      `;
      smsMessage = `Dear ${user.name}, your appointment with Dr. ${doctorUser.name} on ${formattedDate} at ${time} is requested and pending approval.`;
      break;

    case "approved":
      subject = "Appointment Confirmed — MedConsult";
      title = "Your Appointment has been Confirmed!";
      body = `
        <p>Dear ${user.name},</p>
        <p>Great news! Your scheduled appointment with <strong>Dr. ${doctorUser.name}</strong> has been officially confirmed.</p>
        <div style="background-color: #FDFBF7; border: 1px solid #E6DFD3; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <strong>Appointment Details:</strong><br/>
          • Doctor: Dr. ${doctorUser.name}<br/>
          • Date: ${formattedDate}<br/>
          • Time: ${time}<br/>
          • Location: ${appointment.doctorId?.location || "Main Practice Clinic"}<br/>
          • Status: Scheduled / Confirmed
        </div>
        <p>Please log into your patient dashboard to see details, manage instructions, or view clinical recommendations.</p>
      `;
      smsMessage = `CONFIRMED: Your appointment with Dr. ${doctorUser.name} on ${formattedDate} at ${time} is officially Scheduled. Location: ${appointment.doctorId?.location || "Main Practice Clinic"}.`;
      break;

    case "rejected":
      subject = "Appointment Update — MedConsult";
      title = "Appointment Request Declined";
      body = `
        <p>Dear ${user.name},</p>
        <p>We regret to inform you that your appointment request with <strong>Dr. ${doctorUser.name}</strong> on ${formattedDate} at ${time} could not be accepted at this time.</p>
        ${appointment.doctorNote ? `<p><strong>Doctor's Feedback:</strong> "${appointment.doctorNote}"</p>` : ""}
        <p>Please visit the doctor browsing page to check other available slots or find another specialist.</p>
      `;
      smsMessage = `DECLINED: Your appointment request with Dr. ${doctorUser.name} on ${formattedDate} at ${time} was declined. Please reschedule on the portal.`;
      break;

    case "completed":
      subject = "Appointment Summary — MedConsult";
      title = "Appointment Completed";
      body = `
        <p>Dear ${user.name},</p>
        <p>Your appointment with <strong>Dr. ${doctorUser.name}</strong> has been marked as completed.</p>
        <div style="background-color: #FDFBF7; border: 1px solid #E6DFD3; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <strong>Appointment Summary:</strong><br/>
          • Date: ${formattedDate}<br/>
          • Time: ${time}<br/>
          ${appointment.visitSummary ? `• Visit Summary: ${appointment.visitSummary}<br/>` : ""}
          ${appointment.recommendations ? `• Recommendations: ${appointment.recommendations}<br/>` : ""}
        </div>
        <p>All summaries, clinical recommendations, and prescriptions are securely stored under your patient records page.</p>
      `;
      smsMessage = `COMPLETED: Your appointment with Dr. ${doctorUser.name} is completed. Visit summaries are available on your MedConsult dashboard.`;
      break;

    case "cancelled":
      subject = "Appointment Cancelled — MedConsult";
      title = "Appointment Cancelled";
      body = `
        <p>Dear ${user.name},</p>
        <p>Your scheduled appointment with <strong>Dr. ${doctorUser.name}</strong> on ${formattedDate} at ${time} has been cancelled.</p>
        ${appointment.doctorNote ? `<p><strong>Reason:</strong> ${appointment.doctorNote}</p>` : ""}
        <p>If this was done in error or you need to reschedule, please visit your portal to book a new appointment.</p>
      `;
      smsMessage = `CANCELLED: Your appointment with Dr. ${doctorUser.name} on ${formattedDate} at ${time} has been cancelled. Check your portal.`;
      break;

    default:
      return;
  }

  // Send email to patient
  await sendEmail({ to: user.email, subject, title, body });

  // Send SMS to patient
  if (user.phone) {
    sendSMSLog(user.phone, smsMessage);
  }
}

/**
 * Sends a registration OTP verification code.
 */
async function sendOtpEmail(email, code) {
  const subject = "Email Verification OTP — MedConsult";
  const title = "Verify Your Email Address";
  const body = `
    <p>You have initiated a registration request on the <strong>MedConsult</strong> portal.</p>
    <p>Please use the following 6-digit verification code to complete your registration:</p>
    <div style="font-family: monospace; font-size: 28px; font-weight: bold; background-color: #FDFBF7; border: 1px solid #E6DFD3; padding: 15px 30px; text-align: center; border-radius: 4px; margin: 20px auto; max-width: 200px; letter-spacing: 5px;">
      ${code}
    </div>
    <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
  `;
  return sendEmail({ to: email, subject, title, body });
}

module.exports = {
  sendWelcomeEmail,
  sendAppointmentEmail,
  sendSMSLog,
  sendOtpEmail,
};
