// =============================================================
//  controllers/admin.controller.js — Admin Business Logic
//
//  ALL endpoints require the requireAdmin middleware.
//  Mounted at /api/v1/admin
//
//  User management:
//    GET  /users                 → getAllUsers
//    GET  /users/:id             → getUserById
//    PUT  /users/:id/deactivate  → deactivateUser
//    PUT  /users/:id/activate    → activateUser
//
//  Doctor application management (Doctor Elevation Flow — Step 2):
//    GET  /doctors/pending       → getPendingApplications
//    PUT  /doctors/:id/approve   → approveDoctor
//    PUT  /doctors/:id/reject    → rejectDoctor
//    GET  /doctors               → getAllDoctors
//
//  Appointment oversight:
//    GET  /appointments          → getAllAppointments
//
//  Dashboard:
//    GET  /stats                 → getPlatformStats
//
//  Notification management:
//    GET  /notifications/:userId → getUserNotifications
// =============================================================

const User        = require("../models/User");
const Doctor      = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const { NOTIFICATION_TYPES } = require("../models/Notification");
const { AppError } = require("../utils/errorHandler");

// ── USER MANAGEMENT ───────────────────────────────────────────

/**
 * GET /api/v1/admin/users
 * Lists all users with optional filtering and pagination.
 */
async function getAllUsers(req, res) {
  const { type, isActive, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (type)     filter.type     = type;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { users },
  });
}

/**
 * GET /api/v1/admin/users/:id
 */
async function getUserById(req, res, next) {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));
  res.status(200).json({ success: true, data: { user } });
}

/**
 * PUT /api/v1/admin/users/:id/deactivate
 * Soft-delete: sets isActive = false.
 * Prevents login via the requireAuth check.
 */
async function deactivateUser(req, res, next) {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));

  // Prevent an admin from accidentally deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError("You cannot deactivate your own account.", 400));
  }

  user.isActive = false;
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: `Account for ${user.name} has been deactivated.`,
    data: { user },
  });
}

/**
 * PUT /api/v1/admin/users/:id/activate
 */
async function activateUser(req, res, next) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true, runValidators: false }
  );
  if (!user) return next(new AppError("User not found.", 404));

  res.status(200).json({
    success: true,
    message: `Account for ${user.name} has been reactivated.`,
    data: { user },
  });
}

// ── DOCTOR ELEVATION FLOW — STEP 2 ───────────────────────────

/**
 * GET /api/v1/admin/doctors/pending
 * Returns all pending doctor applications for the review queue.
 */
async function getPendingApplications(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Doctor.countDocuments({ status: "pending" });

  const doctors = await Doctor.find({ status: "pending" })
    .populate("userId", "name email phone createdAt")
    .sort({ createdAt: 1 }) // oldest first — FIFO review queue
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: doctors.length,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { doctors },
  });
}

/**
 * PUT /api/v1/admin/doctors/:id/approve
 *
 * Doctor Elevation Flow — Step 2 (approve).
 *   1. Set Doctor.status → 'approved'
 *   2. Set linked User.type → 'doctor'
 *   3. Send notification to the applicant
 */
async function approveDoctor(req, res, next) {
  const doctor = await Doctor.findById(req.params.id).populate(
    "userId",
    "name email type"
  );
  if (!doctor) return next(new AppError("Doctor application not found.", 404));

  if (doctor.status !== "pending") {
    return next(
      new AppError(
        `This application has already been ${doctor.status}. No action taken.`,
        400
      )
    );
  }

  // ── Atomic-ish two-document update ───────────────────────
  // 1. Approve the Doctor document
  doctor.status    = "approved";
  doctor.adminNote = req.body.adminNote || null;
  await doctor.save();

  // 2. Elevate the User role and mark as verified
  await User.findByIdAndUpdate(doctor.userId._id, {
    type:       "doctor",
    role:       "doctor",
    isVerified: true,      // unlocks requireVerification-guarded provider routes
  });


  // 3. Notify the applicant
  await Notification.createForUser({
    userId:    doctor.userId._id,
    message:   `Congratulations, ${doctor.userId.name}! Your doctor application has been approved. You can now manage appointments.`,
    type:      NOTIFICATION_TYPES.DOCTOR_APPROVED,
    relatedId: doctor._id,
  });

  res.status(200).json({
    success: true,
    message: `Dr. ${doctor.userId.name}'s application has been approved.`,
    data: { doctor },
  });
}

/**
 * PUT /api/v1/admin/doctors/:id/reject
 *
 * Doctor Elevation Flow — Step 2 (reject).
 * The user type remains 'user'; they cannot reapply.
 */
async function rejectDoctor(req, res, next) {
  const doctor = await Doctor.findById(req.params.id).populate(
    "userId",
    "name email"
  );
  if (!doctor) return next(new AppError("Doctor application not found.", 404));

  if (doctor.status !== "pending") {
    return next(
      new AppError(
        `This application has already been ${doctor.status}. No action taken.`,
        400
      )
    );
  }

  doctor.status    = "rejected";
  doctor.adminNote = req.body.adminNote || "Your application did not meet our requirements.";
  await doctor.save();

  // Ensure isVerified is explicitly false so the user cannot bypass requireVerification
  await User.findByIdAndUpdate(doctor.userId._id, { isVerified: false });

  // Notify the applicant
  await Notification.createForUser({
    userId:    doctor.userId._id,
    message:   `Your doctor application has been reviewed and was not approved at this time. Reason: ${doctor.adminNote}`,
    type:      NOTIFICATION_TYPES.DOCTOR_REJECTED,
    relatedId: doctor._id,
  });

  res.status(200).json({
    success: true,
    message: `${doctor.userId.name}'s application has been rejected.`,
    data: { doctor },
  });
}

/**
 * GET /api/v1/admin/doctors
 * All doctor records (any status) with full filtering.
 */
async function getAllDoctors(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Doctor.countDocuments(filter);

  const doctors = await Doctor.find(filter)
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: doctors.length,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { doctors },
  });
}

// ── APPOINTMENT OVERSIGHT ─────────────────────────────────────

/**
 * GET /api/v1/admin/appointments
 * Full appointment ledger with rich filtering.
 */
async function getAllAppointments(req, res) {
  const { status, doctorId, patientId, date, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status)    filter.status    = status;
  if (doctorId)  filter.doctorId  = doctorId;
  if (patientId) filter.patientId = patientId;
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: d, $lte: end };
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("patientId", "name email")
    .populate({
      path:     "doctorId",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: appointments.length,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { appointments },
  });
}

// ── PLATFORM STATS ────────────────────────────────────────────

/**
 * GET /api/v1/admin/stats
 * Aggregated platform metrics for the admin dashboard.
 */
async function getPlatformStats(req, res) {
  const [
    totalUsers,
    totalDoctors,
    pendingDoctors,
    totalAppointments,
    appointmentsByStatus,
  ] = await Promise.all([
    User.countDocuments({ type: "user" }),
    Doctor.countDocuments({ status: "approved" }),
    Doctor.countDocuments({ status: "pending" }),
    Appointment.countDocuments(),
    Appointment.aggregate([
      {
        $group: {
          _id:   "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Reshape the aggregation output into a plain object
  const byStatus = appointmentsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        appointmentsByStatus: byStatus,
      },
    },
  });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────

/**
 * GET /api/v1/admin/notifications/:userId
 * Admin can inspect notifications for any user (audit / support).
 */
async function getUserNotifications(req, res, next) {
  const user = await User.findById(req.params.userId);
  if (!user) return next(new AppError("User not found.", 404));

  const notifications = await Notification.find({
    userId: req.params.userId,
  }).sort({ createdAt: -1 }).limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: { notifications },
  });
}

module.exports = {
  getAllUsers,
  getUserById,
  deactivateUser,
  activateUser,
  getPendingApplications,
  approveDoctor,
  rejectDoctor,
  getAllDoctors,
  getAllAppointments,
  getPlatformStats,
  getUserNotifications,
};
