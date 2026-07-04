// =============================================================
//  routes/auth.routes.js — Authentication Routes
//
//  Base path: /api/v1/auth  (mounted in server.js)
//
//  Public:
//    POST   /register  — create a new patient account
//    POST   /login     — obtain a JWT
//
//  Protected (requires valid JWT):
//    GET    /me        — fetch own profile
//    PUT    /password  — change own password
//    PUT    /profile   — update name / phone
//    POST   /photo     — upload profile picture (multipart/form-data)
// =============================================================

const router = require("express").Router();

const {
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
} = require("../controllers/auth.controller");

const { requireAuth } = require("../middleware/auth.middleware");
const upload = require("../config/multer");

// ── Public routes ─────────────────────────────────────────────
router.post("/register-intent",    registerIntent);
router.post("/verify-otp",          verifyOtp);
router.post("/register",            register);          // legacy — patient, kept for backward compat
router.post("/register/patient",    registerPatient);   // dedicated patient pipeline
router.post("/register/doctor",     registerDoctor);    // dedicated doctor pipeline (isVerified=false)
router.post("/google",              googleLogin);
router.post("/login",               login);

// ── Protected routes ──────────────────────────────────────────
router.get( "/me",       requireAuth, getMe);
router.put( "/password", requireAuth, changePassword);
router.put( "/profile",  requireAuth, updateProfile);
router.post("/photo",    requireAuth, upload.single("photo"), uploadUserPhoto);

module.exports = router;
