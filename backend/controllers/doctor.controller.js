// =============================================================
//  controllers/doctor.controller.js — Doctor Business Logic
//
//  Endpoints (mounted at /api/v1/doctors):
//
//  Public:
//    GET  /             → searchDoctors     (filter by specialization, location, fee)
//    GET  /:id          → getDoctorById     (public profile page)
//
//  Patient (requireUser):
//    POST /apply        → applyAsDoctor     (Doctor Elevation Flow — Step 1)
//
//  Doctor (requireDoctor):
//    GET  /me/profile   → getMyDoctorProfile
//    PUT  /me/profile   → updateDoctorProfile
//    PUT  /me/timings   → updateTimings
//
//  Admin (requireAdmin):  ← handled in admin.routes.js
//    GET  /pending      → getPendingApplications
//    PUT  /:id/approve  → approveDoctor
//    PUT  /:id/reject   → rejectDoctor
// =============================================================

const Doctor = require("../models/Doctor");
const User   = require("../models/User");
const Notification = require("../models/Notification");
const { NOTIFICATION_TYPES } = require("../models/Notification");
const { AppError } = require("../utils/errorHandler");
const dayjs = require("dayjs");

// ── Helpers ───────────────────────────────────────────────────

/**
 * Validates a HH:MM 24-hour time string.
 * @param {string} t
 * @returns {boolean}
 */
function isValidTime(t) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);
}

/**
 * Validates a single timing slot object { day, startTime, endTime }.
 * Returns an error message string or null if valid.
 */
function validateTiming(slot) {
  const validDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
  ];
  if (!validDays.includes(slot.day))       return `"${slot.day}" is not a valid day.`;
  if (!isValidTime(slot.startTime))        return `startTime "${slot.startTime}" must be HH:MM (24h).`;
  if (!isValidTime(slot.endTime))          return `endTime "${slot.endTime}" must be HH:MM (24h).`;
  if (slot.startTime >= slot.endTime)      return `startTime must be before endTime on ${slot.day}.`;
  return null;
}

// ── PUBLIC ────────────────────────────────────────────────────

/**
 * GET /api/v1/doctors
 * Search approved doctors.
 *
 * Query params:
 *   specialization  — case-insensitive partial match
 *   location        — case-insensitive partial match
 *   minFee / maxFee — numeric fee range
 *   page / limit    — pagination (default: page 1, limit 10)
 */
async function searchDoctors(req, res) {
  const {
    specialization,
    location,
    minFee,
    maxFee,
    day,
    page  = 1,
    limit = 10,
  } = req.query;

  // Build the filter — always restrict to approved profiles
  const filter = { status: "approved" };

  if (specialization) {
    filter.specialization = { $regex: specialization, $options: "i" };
  }
  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }
  if (minFee !== undefined || maxFee !== undefined) {
    filter.fees = {};
    if (minFee !== undefined) filter.fees.$gte = Number(minFee);
    if (maxFee !== undefined) filter.fees.$lte = Number(maxFee);
  }
  if (day) {
    filter["timings.day"] = day;
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Doctor.countDocuments(filter);

  const doctors = await Doctor.find(filter)
    .populate("userId", "name email phone") // hydrate the linked User
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count:   doctors.length,
    total,
    page:    Number(page),
    pages:   Math.ceil(total / Number(limit)),
    data: { doctors },
  });
}

/**
 * GET /api/v1/doctors/:id
 * Fetch a single approved doctor profile (public).
 */
async function getDoctorById(req, res, next) {
  const doctor = await Doctor.findById(req.params.id).populate(
    "userId",
    "name email phone"
  );

  if (!doctor || doctor.status !== "approved") {
    return next(new AppError("Doctor not found.", 404));
  }

  res.status(200).json({ success: true, data: { doctor } });
}

// ── DOCTOR (self-management) ──────────────────────────────────

/**
 * GET /api/v1/doctors/me/profile
 * Returns the logged-in doctor's own full profile.
 */
async function getMyDoctorProfile(req, res, next) {
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    return next(new AppError("Doctor profile not found.", 404));
  }
  res.status(200).json({ success: true, data: { doctor } });
}

/**
 * PUT /api/v1/doctors/me/profile
 * Updates mutable profile fields.
 * Does NOT allow changing userId, status, or adminNote.
 */
async function updateDoctorProfile(req, res, next) {
  // Whitelist updatable fields to prevent mass-assignment
  const ALLOWED = [
    "specialization", "location", "experience",
    "fees", "bio", "profilePhoto",
  ];

  const updates = {};
  ALLOWED.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError("No valid fields provided for update.", 400));
  }

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!doctor) return next(new AppError("Doctor profile not found.", 404));

  res.status(200).json({ success: true, data: { doctor } });
}

/**
 * PUT /api/v1/doctors/me/timings
 * Replaces the entire timings array.
 * We replace (not merge) so the doctor can delete old slots.
 */
async function updateTimings(req, res, next) {
  const { timings } = req.body;

  if (!Array.isArray(timings) || timings.length === 0) {
    return next(new AppError("At least one timing slot is required.", 400));
  }

  for (const slot of timings) {
    const err = validateTiming(slot);
    if (err) return next(new AppError(err, 400));
  }

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { timings } },
    { new: true, runValidators: true }
  );

  if (!doctor) return next(new AppError("Doctor profile not found.", 404));

  res.status(200).json({ success: true, data: { doctor } });
}

/**
 * POST /api/v1/doctors/me/photo
 * Allows an approved doctor to upload their profile picture.
 * Multer middleware (single('photo')) is applied at the route level.
 */
async function uploadProfilePhoto(req, res, next) {
  if (!req.file) {
    return next(new AppError("No file uploaded. Please attach an image.", 400));
  }

  const uploadDir = process.env.UPLOAD_DIR || "uploads";
  const idx = req.file.path.replace(/\\/g, "/").indexOf(uploadDir);
  const photoUrl = idx !== -1
    ? req.file.path.replace(/\\/g, "/").slice(idx)
    : req.file.path.replace(/\\/g, "/");

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { profilePhoto: photoUrl } },
    { new: true }
  );

  if (!doctor) return next(new AppError("Doctor profile not found.", 404));

  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully.",
    data: { doctor },
  });
}

module.exports = {
  searchDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  updateTimings,
  uploadProfilePhoto,
};
