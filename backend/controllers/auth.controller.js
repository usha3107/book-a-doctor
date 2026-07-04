// =============================================================
//  controllers/auth.controller.js — Authentication Controller
//
//  Endpoints:
//    POST /api/v1/auth/register-intent      → registerIntent
//    POST /api/v1/auth/verify-otp           → verifyOtp
//    POST /api/v1/auth/register             → register  (legacy, patient)
//    POST /api/v1/auth/register/patient     → registerPatient
//    POST /api/v1/auth/register/doctor      → registerDoctor
//    POST /api/v1/auth/google               → googleLogin
//    POST /api/v1/auth/login                → login
//    GET  /api/v1/auth/me                   → getMe        (requireAuth)
//    PUT  /api/v1/auth/password             → changePassword (requireAuth)
//    PUT  /api/v1/auth/profile              → updateProfile  (requireAuth)
//    POST /api/v1/auth/photo                → uploadUserPhoto (requireAuth)
//
//  Design notes:
//    • Passwords are hashed by the User pre-save hook.
//    • registerPatient/registerDoctor reuse the same OTP flow as register.
//    • Doctors start with isVerified=false; admin approval sets it to true.
// =============================================================

const User   = require("../models/User");
const Doctor = require("../models/Doctor");
const Otp    = require("../models/Otp");
const { createSendToken } = require("../utils/jwt");
const { AppError }        = require("../utils/errorHandler");
const { sendOtpEmail }    = require("../utils/mailer");

// Helper to generate 6-digit random code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── POST /api/v1/auth/register-intent ─────────────────────────
async function registerIntent(req, res, next) {
  const { name, email } = req.body;

  if (!name || !email) {
    return next(new AppError("Name and email are required to request verification code.", 400));
  }

  const emailStr = email.toLowerCase().trim();
  if (!emailStr.endsWith("@gmail.com")) {
    return next(new AppError("Only official @gmail.com accounts are permitted.", 400));
  }

  const existing = await User.findOne({ email: emailStr });
  if (existing) {
    return next(new AppError("An account with this email address already exists.", 409));
  }

  // Generate 6-digit OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Clear previous OTPs for this email and purpose to prevent duplicates
  await Otp.deleteMany({ email: emailStr, purpose: "register" });

  // Save the new OTP document in MongoDB
  await Otp.create({
    email: emailStr,
    code,
    purpose: "register",
    expiresAt,
  });

  // Send Email
  const sent = await sendOtpEmail(emailStr, code);
  if (!sent) {
    return next(new AppError("Failed to send verification email. Please try again.", 500));
  }

  res.status(200).json({
    success: true,
    message: "Verification OTP code sent to your email.",
  });
}

// ── POST /api/v1/auth/verify-otp ──────────────────────────────
async function verifyOtp(req, res, next) {
  const { email, code } = req.body;

  if (!email || !code) {
    return next(new AppError("Email and verification code are required.", 400));
  }

  const emailStr = email.toLowerCase().trim();
  const otpRecord = await Otp.findOne({ email: emailStr, purpose: "register" });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return next(new AppError("Invalid verification code or code has expired.", 401));
  }

  if (otpRecord.code !== code) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return next(new AppError("Verification failed: maximum attempts exceeded.", 401));
    }

    return next(new AppError("Invalid verification code.", 401));
  }

  // Delete OTP document upon successful verification
  await Otp.deleteOne({ _id: otpRecord._id });

  res.status(200).json({
    success: true,
    message: "Email verified successfully.",
  });
}

// ── POST /api/v1/auth/register ───────────────────────────────
/**
 * register
 * Creates a new standard user account (type: 'user') after verifying OTP.
 */
async function register(req, res, next) {
  const { name, email, password, phone, code } = req.body;

  if (!name || !email || !password || !code) {
    return next(new AppError("Name, email, password, and verification code are required.", 400));
  }

  const emailStr = email.toLowerCase().trim();
  if (!emailStr.endsWith("@gmail.com")) {
    return next(new AppError("Only official @gmail.com accounts are permitted.", 400));
  }

  // Strong password requirements check
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.",
        400
      )
    );
  }

  // Check duplicate user again to prevent race condition
  const existing = await User.findOne({ email: emailStr });
  if (existing) {
    return next(new AppError("An account with this email address already exists.", 409));
  }

  const newUser = await User.create({
    name,
    email: emailStr,
    password,
    phone: phone || undefined,
    role: "patient",
    type: "user",
  });

  // Send welcome email asynchronously
  try {
    const { sendWelcomeEmail } = require("../utils/mailer");
    sendWelcomeEmail(newUser).catch(err => console.error("[Mailer] Welcome email failed:", err.message));
  } catch (err) {
    console.error("[Mailer] Welcome email trigger error:", err.message);
  }

  // Sign JWT and send response (201 Created)
  createSendToken(newUser, 201, res);
}

// ── POST /api/v1/auth/google ─────────────────────────────────
async function googleLogin(req, res, next) {
  let { email, name, credential } = req.body;

  // Verify Google ID Token if passed
  if (credential) {
    try {
      console.log("[Google Auth] Verifying credential token with Google tokeninfo...");
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const payload = await googleRes.json();
      console.log("[Google Auth] Tokeninfo payload:", JSON.stringify(payload, null, 2));

      if (!googleRes.ok) {
        console.error("[Google Auth] Tokeninfo request failed:", payload);
        return next(new AppError("Failed to verify Google OAuth token.", 401));
      }

      // Verify audience match
      if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        console.error(
          `[Google Auth] Audience mismatch! Expected: ${process.env.GOOGLE_CLIENT_ID}, Got: ${payload.aud}`
        );
        return next(new AppError("Invalid Google Client Audience match.", 401));
      }

      email = payload.email;
      name  = payload.name || payload.given_name || "Google User";
      console.log(`[Google Auth] Token valid. email=${email}, name=${name}`);
    } catch (err) {
      console.error("[Google Auth] Token verification threw:", err);
      return next(new AppError("Google token verification connection failed.", 401));
    }
  }

  if (!email || !name) {
    return next(new AppError("Email and Name (or Google credential) are required for authentication.", 400));
  }

  const emailStr = email.toLowerCase().trim();
  if (!emailStr.endsWith("@gmail.com")) {
    return next(new AppError("Only official @gmail.com accounts are permitted.", 400));
  }

  // Find user or create if they do not exist
  let user = await User.findOne({ email: emailStr });
  if (!user) {
    console.log(`[Google Auth] New user — creating account for ${emailStr}`);
    // Generate a secure random password for OAuth registered users
    const crypto = require("crypto");
    const randomPassword = crypto.randomBytes(16).toString("hex") + "A1!";

    try {
      user = await User.create({
        name,
        email:    emailStr,
        password: randomPassword,
        role:     "patient",
        type:     "user",
        isVerified: true,
      });
      console.log(`[Google Auth] New patient account created: ${user._id}`);
    } catch (dbErr) {
      console.error("[Google Auth] User.create failed:", dbErr.message, dbErr.errors);
      return next(new AppError("Failed to create account. Please try again.", 500));
    }

    try {
      const { sendWelcomeEmail } = require("../utils/mailer");
      sendWelcomeEmail(user).catch(() => {});
    } catch (_) {}
  } else {
    console.log(`[Google Auth] Existing user found: ${user._id} (role: ${user.role})`);
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 403));
  }

  createSendToken(user, 200, res);
}

// ── POST /api/v1/auth/login ──────────────────────────────────
/**
 * login
 * Validates credentials and returns a JWT on success.
 */
async function login(req, res, next) {
  const { email, password } = req.body;

  // Basic presence check
  if (!email || !password) {
    return next(new AppError("Please provide your email and password.", 400));
  }

  // Fetch user WITH the password hash (select: false in schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // Intentionally vague message — do not reveal whether the email exists
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  // Check account is active
  if (!user.isActive) {
    return next(
      new AppError("Your account has been deactivated. Please contact support.", 403)
    );
  }

  // Sign JWT and send response (200 OK)
  createSendToken(user, 200, res);
}

// ── GET /api/v1/auth/me ──────────────────────────────────────
/**
 * getMe
 * Returns the currently authenticated user's profile.
 * req.user is attached by the requireAuth middleware.
 */
async function getMe(req, res) {
  // req.user was fetched (without password) by requireAuth
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
}

// ── PUT /api/v1/auth/password ────────────────────────────────
/**
 * changePassword
 * Allows an authenticated user to update their own password.
 * Requires the current password for verification.
 */
async function changePassword(req, res, next) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Please provide your current password and a new password.", 400)
    );
  }

  if (newPassword.length < 8) {
    return next(new AppError("New password must be at least 8 characters.", 400));
  }

  if (currentPassword === newPassword) {
    return next(
      new AppError("New password must be different from the current password.", 400)
    );
  }

  // Re-fetch the user with the password hash
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  // Assign new password — pre-save hook handles hashing
  user.password = newPassword;
  await user.save();

  // Issue a new token so the client stays logged in seamlessly
  createSendToken(user, 200, res);
}

// ── PUT /api/v1/auth/profile ───────────────────────────────
/**
 * updateProfile
 * Allows an authenticated user to update their own name and phone number.
 * Prevents mass-assignment: only name, phone are editable this way.
 */
async function updateProfile(req, res, next) {
  const ALLOWED = [
    "name",
    "phone",
    "gender",
    "dateOfBirth",
    "bloodGroup",
    "allergies",
    "medicalHistory",
  ];
  const updates = {};
  ALLOWED.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError("No valid fields provided for update.", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: { user },
  });
}

// ── POST /api/v1/auth/photo ─────────────────────────────────
/**
 * uploadUserPhoto
 * Allows an authenticated user to upload their own profile picture.
 * Multer middleware (single('photo')) is applied at the route level.
 */
async function uploadUserPhoto(req, res, next) {
  if (!req.file) {
    return next(new AppError("No file uploaded. Please attach an image.", 400));
  }

  // Build a server-relative URL path from the multer file object
  const uploadDir = process.env.UPLOAD_DIR || "uploads";
  const idx = req.file.path.replace(/\\/g, "/").indexOf(uploadDir);
  const photoUrl = idx !== -1
    ? req.file.path.replace(/\\/g, "/").slice(idx)
    : req.file.path.replace(/\\/g, "/");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { profilePhoto: photoUrl } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully.",
    data: { user },
  });
}

// ── POST /api/v1/auth/register/patient ───────────────────────
/**
 * registerPatient
 * Dedicated patient registration endpoint.
 * Accepts the same OTP-verified payload as the legacy `register` endpoint
 * but ALWAYS forces role = 'patient', type = 'user', and isVerified = true
 * (patients do not require clinical verification).
 *
 * Required body fields: name, email, password, code (OTP)
 * Optional body fields: phone
 */
async function registerPatient(req, res, next) {
  const { name, email, password, phone, code } = req.body;

  if (!name || !email || !password || !code) {
    return next(
      new AppError(
        "Name, email, password, and OTP verification code are required.",
        400
      )
    );
  }

  const emailStr = email.toLowerCase().trim();
  if (!emailStr.endsWith("@gmail.com")) {
    return next(
      new AppError("Only official @gmail.com accounts are permitted.", 400)
    );
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must be ≥8 characters and include uppercase, lowercase, digit, and special character.",
        400
      )
    );
  }

  const existing = await User.findOne({ email: emailStr });
  if (existing) {
    return next(
      new AppError("An account with this email address already exists.", 409)
    );
  }

  const newUser = await User.create({
    name,
    email:      emailStr,
    password,
    phone:      phone || undefined,
    role:       "patient",
    type:       "user",
    isVerified: true,   // patients are verified immediately — no clinical review needed
  });

  try {
    const { sendWelcomeEmail } = require("../utils/mailer");
    sendWelcomeEmail(newUser).catch((err) =>
      console.error("[Mailer] Patient welcome email failed:", err.message)
    );
  } catch (err) {
    console.error("[Mailer] Patient welcome email trigger error:", err.message);
  }

  createSendToken(newUser, 201, res);
}

// ── POST /api/v1/auth/register/doctor ────────────────────────
/**
 * registerDoctor
 * Dedicated doctor registration endpoint.
 * Forces role = 'doctor', type = 'doctor', and isVerified = false.
 * Admin must approve (via /api/v1/admin/doctors/:id/approve) before
 * the doctor can access verified-only provider routes.
 *
 * Required body fields: name, email, password, code, specialty, licenseNumber
 * Optional body fields: phone, clinicAddress
 *
 * Creates a linked Doctor document for the admin review queue.
 */
async function registerDoctor(req, res, next) {
  const {
    name,
    email,
    password,
    phone,
    code,
    specialty,
    licenseNumber,
    clinicAddress,
  } = req.body;

  // ── 1. Required field validation ────────────────────────────
  if (!name || !email || !password || !code) {
    return next(
      new AppError(
        "Name, email, password, and OTP verification code are required.",
        400
      )
    );
  }

  if (!specialty) {
    return next(new AppError("Specialty / medical field is required for doctor registration.", 400));
  }

  if (!licenseNumber) {
    return next(new AppError("Medical license number is required for doctor registration.", 400));
  }

  // ── 2. Domain restriction ────────────────────────────────────
  const emailStr = email.toLowerCase().trim();
  if (!emailStr.endsWith("@gmail.com")) {
    return next(
      new AppError("Only official @gmail.com accounts are permitted.", 400)
    );
  }

  // ── 3. Password strength ─────────────────────────────────────
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must be ≥8 characters and include uppercase, lowercase, digit, and special character.",
        400
      )
    );
  }

  // ── 5. Duplicate check ───────────────────────────────────────
  const existing = await User.findOne({ email: emailStr });
  if (existing) {
    return next(
      new AppError("An account with this email address already exists.", 409)
    );
  }

  // ── 6. Create User with doctor role ─────────────────────────
  const newUser = await User.create({
    name,
    email:         emailStr,
    password,
    phone:         phone         || undefined,
    role:          "doctor",
    type:          "doctor",
    isVerified:    false,          // must be verified by admin before accessing provider routes
    specialty:     specialty.trim(),
    licenseNumber: licenseNumber.trim(),
    clinicAddress: clinicAddress  ? clinicAddress.trim() : null,
  });

  // ── 7. Create Doctor profile record for admin review queue ──
  // The Doctor document holds availability timings, fees, and admin-approval status.
  // We create a minimal stub; the doctor fills out the full profile after login.
  await Doctor.create({
    userId:         newUser._id,
    specialization: specialty.trim(),
    location:       clinicAddress ? clinicAddress.trim() : "To be confirmed",
    experience:     0,
    fees:           0,
    timings:        [{ day: "Monday", startTime: "09:00", endTime: "17:00" }],
    status:         "pending",
  });

  try {
    const { sendWelcomeEmail } = require("../utils/mailer");
    sendWelcomeEmail(newUser).catch((err) =>
      console.error("[Mailer] Doctor welcome email failed:", err.message)
    );
  } catch (err) {
    console.error("[Mailer] Doctor welcome email trigger error:", err.message);
  }

  // Return 202 Accepted — account created but verification is pending
  const token = require("../utils/jwt").signToken(newUser);
  const userObj = newUser.toObject();

  res.status(202).json({
    success:   true,
    pending:   true,
    message:
      "Doctor account created successfully. Your application is under review. " +
      "You will be notified by email once an admin verifies your credentials.",
    token,
    data: { user: userObj },
  });
}

module.exports = {
  registerIntent,
  verifyOtp,
  register,
  registerPatient,
  registerDoctor,
  googleLogin,
  login,
  getMe,
  changePassword,
  updateProfile,
  uploadUserPhoto,
};
