// =============================================================
//  controllers/appointment.controller.js — Appointment Logic
//
//  Endpoints (mounted at /api/v1/appointments):
//
//  Patient (requireUser):
//    POST  /                → bookAppointment
//    GET   /my              → getMyAppointments
//    DELETE /:id/cancel     → cancelAppointment
//    POST  /:id/document    → uploadDocument   (multer middleware injected in route)
//
//  Doctor (requireDoctor):
//    GET  /doctor           → getDoctorAppointments
//    PUT  /:id/approve      → approveAppointment
//    PUT  /:id/reject       → rejectAppointment
//    PUT  /:id/complete     → completeAppointment
//
//  Shared (requireAuth — patient views their own OR doctor views their own):
//    GET  /:id              → getAppointmentById
// =============================================================

const Appointment = require("../models/Appointment");
const Doctor      = require("../models/Doctor");
const Notification = require("../models/Notification");
const { NOTIFICATION_TYPES } = require("../models/Notification");
const { AppError } = require("../utils/errorHandler");
const dayjs = require("dayjs");
const path  = require("path");

// ── Helpers ───────────────────────────────────────────────────

/**
 * buildDocumentUrl
 * Converts a multer file object to a server-relative URL path
 * that can be stored in Appointment.documentUrl and later served
 * as a static file by Express.
 */
function buildDocumentUrl(file) {
  if (!file) return null;
  // file.path is the absolute disk path, e.g.:
  //   /home/.../uploads/2024-03/1710000000000-abc12345.pdf
  // We want the relative portion starting from 'uploads/'
  const uploadDir = process.env.UPLOAD_DIR || "uploads";
  const idx = file.path.indexOf(uploadDir);
  return idx !== -1 ? file.path.slice(idx) : file.path;
}

// ── PATIENT ───────────────────────────────────────────────────

/**
 * POST /api/v1/appointments
 *
 * Booking Flow — Step 1.
 * Patient books an appointment → status: 'pending'.
 * Doctor must then approve or reject (Step 2 below).
 */
async function bookAppointment(req, res, next) {
  const patientId = req.user._id;
  const { doctorId, date, timeSlot, notes } = req.body;

  // ── 1. Validate inputs ─────────────────────────────────────
  if (!doctorId || !date || !timeSlot) {
    return next(new AppError("doctorId, date, and timeSlot are required.", 400));
  }

  // Parse and normalise date using dayjs (strips time component)
  if (!dayjs(date).isValid()) {
    return next(new AppError("Invalid date format. Use ISO 8601 (YYYY-MM-DD).", 400));
  }
  const appointmentDate = dayjs(date).startOf("day").toDate();
  if (dayjs(appointmentDate).isBefore(dayjs().startOf("day"))) {
    return next(new AppError("Cannot book an appointment in the past.", 400));
  }

  // ── 2. Verify the doctor exists and is approved ────────────
  const doctor = await Doctor.findById(doctorId).populate("userId", "name");
  if (!doctor || doctor.status !== "approved") {
    return next(new AppError("Doctor not found or not accepting appointments.", 404));
  }

  // ── 3. Verify the requested time slot exists in the doctor's schedule ─
  const dayName = dayjs(appointmentDate).format("dddd"); // "Monday", "Tuesday", …
  const slotExists = doctor.timings.some(
    (t) =>
      t.day === dayName &&
      `${t.startTime} - ${t.endTime}` === timeSlot
  );
  if (!slotExists) {
    return next(
      new AppError(
        `Time slot "${timeSlot}" is not available for ${dayName}. ` +
          "Please choose from the doctor's listed timings.",
        400
      )
    );
  }

  // ── 4. Prevent a patient from double-booking the same slot ─
  const existingByPatient = await Appointment.findOne({
    patientId,
    doctorId,
    date:     appointmentDate,
    timeSlot,
    status:   { $in: ["pending", "approved"] },
  });
  if (existingByPatient) {
    return next(
      new AppError(
        "You already have an active booking for this slot with this doctor.",
        409
      )
    );
  }

  // ── 5. Create the appointment ──────────────────────────────
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    date:     appointmentDate,
    timeSlot,
    notes:    notes || undefined,
    status:   "pending",
  });

  // ── 6. Notify the doctor ───────────────────────────────────
  await Notification.createForUser({
    userId:    doctor.userId._id,
    message:   `New appointment request from ${req.user.name} on ${dayjs(appointmentDate).format("DD MMM YYYY")} at ${timeSlot}.`,
    type:      NOTIFICATION_TYPES.APPOINTMENT_BOOKED,
    relatedId: appointment._id,
  });

  // Send email alert asynchronously
  try {
    const { sendAppointmentEmail } = require("../utils/mailer");
    const doctorUser = doctor.userId || {};
    sendAppointmentEmail(req.user, doctorUser, appointment, "booked")
      .catch((err) => console.error("[Mailer] Appointment booked email alert failed:", err.message));
  } catch (err) {
    console.error("[Mailer] Appointment booked email trigger error:", err.message);
  }

  res.status(201).json({
    success: true,
    message:
      "Appointment booked successfully. Awaiting doctor confirmation.",
    data: { appointment },
  });
}

/**
 * GET /api/v1/appointments/my
 * Returns all appointments for the logged-in patient with full
 * doctor and user details populated.
 */
async function getMyAppointments(req, res) {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { patientId: req.user._id };
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate({
      path:     "doctorId",
      populate: { path: "userId", select: "name email phone" },
    })
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count:   appointments.length,
    total,
    page:    Number(page),
    pages:   Math.ceil(total / Number(limit)),
    data: { appointments },
  });
}

/**
 * DELETE /api/v1/appointments/:id/cancel
 * Patient cancels a pending appointment.
 * Only 'pending' appointments can be cancelled by the patient.
 */
async function cancelAppointment(req, res, next) {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patientId", "name email phone")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name email phone" }
    });

  if (!appointment) return next(new AppError("Appointment not found.", 404));

  // Ownership check (patients can only cancel their own, admins can cancel any)
  if (appointment.patientId._id.toString() !== req.user._id.toString() && req.user.type !== "admin") {
    return next(
      new AppError("You are not authorised to cancel this appointment.", 403)
    );
  }

  // Patients can only cancel pending. Admins can cancel pending or approved.
  const allowedStatuses = req.user.type === "admin" ? ["pending", "approved"] : ["pending"];
  if (!allowedStatuses.includes(appointment.status)) {
    return next(
      new AppError(
        `Cannot cancel an appointment with status "${appointment.status}".`,
        400
      )
    );
  }

  appointment.status = "cancelled";
  if (req.user.type === "admin" && req.body.adminNote) {
    appointment.doctorNote = `Cancelled by Admin: ${req.body.adminNote}`;
  }
  await appointment.save();

  // Notify the doctor
  const doctor = appointment.doctorId;
  if (doctor) {
    await Notification.createForUser({
      userId:    doctor.userId._id,
      message:   `Appointment on ${dayjs(appointment.date).format("DD MMM YYYY")} at ${appointment.timeSlot} was cancelled.`,
      type:      NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
      relatedId: appointment._id,
    });
  }

  // Send email alert asynchronously
  try {
    const { sendAppointmentEmail } = require("../utils/mailer");
    const doctorUser = doctor?.userId || {};
    sendAppointmentEmail(appointment.patientId, doctorUser, appointment, "cancelled")
      .catch((err) => console.error("[Mailer] Appointment cancelled email alert failed:", err.message));
  } catch (err) {
    console.error("[Mailer] Appointment cancelled email trigger error:", err.message);
  }

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully.",
    data: { appointment },
  });
}

/**
 * POST /api/v1/appointments/:id/document
 * Patient attaches a medical document to an existing appointment.
 * Multer middleware is applied at the route level (single('document')).
 */
async function uploadDocument(req, res, next) {
  if (!req.file) {
    return next(new AppError("No file uploaded. Please attach a document.", 400));
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new AppError("Appointment not found.", 404));

  // Ownership check
  if (appointment.patientId.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You are not authorised to modify this appointment.", 403)
    );
  }

  if (!["pending", "approved"].includes(appointment.status)) {
    return next(
      new AppError(
        "Documents can only be attached to pending or approved appointments.",
        400
      )
    );
  }

  appointment.documentUrl = buildDocumentUrl(req.file);
  await appointment.save();

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully.",
    data: { appointment },
  });
}

// ── DOCTOR ────────────────────────────────────────────────────

/**
 * GET /api/v1/appointments/doctor
 * Returns all appointments assigned to the logged-in doctor.
 */
async function getDoctorAppointments(req, res, next) {
  // Find the doctor profile linked to this user
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    return next(new AppError("Doctor profile not found.", 404));
  }

  const { status, date, page = 1, limit = 10 } = req.query;

  const filter = { doctorId: doctor._id };
  if (status) filter.status = status;
  if (date) {
    const d = dayjs(date).startOf("day");
    filter.date = { $gte: d.toDate(), $lte: d.endOf("day").toDate() };
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("patientId", "name email phone")
    .sort({ date: 1, timeSlot: 1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count:   appointments.length,
    total,
    page:    Number(page),
    pages:   Math.ceil(total / Number(limit)),
    data: { appointments },
  });
}

/**
 * Helper — shared logic for approve / reject / complete.
 * Finds the appointment, verifies doctor ownership, validates

async function _updateAppointmentStatus(req, res, next, newStatus, notifType, notifMessageFn) {
  let doctor = null;
  if (req.user.type !== "admin") {
    doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return next(new AppError("Doctor profile not found.", 404));
  }

  const appointment = await Appointment.findById(req.params.id)
    .populate("patientId", "name email phone")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name email phone" }
    });

  if (!appointment) return next(new AppError("Appointment not found.", 404));

  if (req.user.type !== "admin" && appointment.doctorId._id.toString() !== doctor._id.toString()) {
    return next(
      new AppError("You are not authorised to manage this appointment.", 403)
    );
  }

  const validPriorStatuses = {
    approved:  ["pending"],
    rejected:  ["pending"],
    completed: ["approved"],
  };
  if (!validPriorStatuses[newStatus].includes(appointment.status)) {
    return next(
      new AppError(
        `Cannot set status to "${newStatus}" from current status "${appointment.status}".`,
        400
      )
    );
  }

  if (req.body.doctorNote) appointment.doctorNote = req.body.doctorNote;
  if (req.body.visitSummary !== undefined) appointment.visitSummary = req.body.visitSummary;
  if (req.body.recommendations !== undefined) appointment.recommendations = req.body.recommendations;

  appointment.status = newStatus;
  await appointment.save();

  await Notification.createForUser({
    userId:    appointment.patientId._id,
    message:   notifMessageFn(appointment),
    type:      notifType,
    relatedId: appointment._id,
  });

  try {
    const { sendAppointmentEmail } = require("../utils/mailer");
    const doctorUser = appointment.doctorId?.userId || {};
    sendAppointmentEmail(appointment.patientId, doctorUser, appointment, newStatus)
      .catch((err) => console.error(`[Mailer] Appointment ${newStatus} email alert failed:`, err.message));
  } catch (err) {
    console.error(`[Mailer] Appointment ${newStatus} email trigger error:`, err.message);
  }

  res.status(200).json({
    success: true,
    message: `Appointment ${newStatus} successfully.`,
    data: { appointment },
  });
}


 * PUT /api/v1/appointments/:id/approve
 */
async function approveAppointment(req, res, next) {
  return _updateAppointmentStatus(
    req, res, next,
    "approved",
    NOTIFICATION_TYPES.APPOINTMENT_APPROVED,
    (appt) =>
      `Your appointment on ${dayjs(appt.date).format("DD MMM YYYY")} at ${appt.timeSlot} has been approved by your doctor.`
  );
}

/**
 * PUT /api/v1/appointments/:id/reject
 */
async function rejectAppointment(req, res, next) {
  return _updateAppointmentStatus(
    req, res, next,
    "rejected",
    NOTIFICATION_TYPES.APPOINTMENT_REJECTED,
    (appt) =>
      `Your appointment on ${dayjs(appt.date).format("DD MMM YYYY")} at ${appt.timeSlot} was unfortunately rejected.${appt.doctorNote ? " Note: " + appt.doctorNote : ""}`
  );
}

/**
 * PUT /api/v1/appointments/:id/complete
 */
async function completeAppointment(req, res, next) {
  return _updateAppointmentStatus(
    req, res, next,
    "completed",
    NOTIFICATION_TYPES.APPOINTMENT_COMPLETED,
    (appt) =>
      `Your appointment on ${dayjs(appt.date).format("DD MMM YYYY")} at ${appt.timeSlot} has been marked as completed.`
  );
}

// ── SHARED ────────────────────────────────────────────────────

/**
 * GET /api/v1/appointments/:id
 * Returns a single appointment.
 * Accessible by the patient who booked it OR the doctor assigned to it.
 */
async function getAppointmentById(req, res, next) {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patientId", "name email phone")
    .populate({
      path:     "doctorId",
      populate: { path: "userId", select: "name email phone" },
    });

  if (!appointment) return next(new AppError("Appointment not found.", 404));

  // Authorisation: patient OR doctor
  const isPatient = appointment.patientId._id.toString() === req.user._id.toString();

  let isDoctor = false;
  if (req.user.type === "doctor") {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    isDoctor = doctorProfile &&
      appointment.doctorId._id.toString() === doctorProfile._id.toString();
  }

  if (!isPatient && !isDoctor && req.user.type !== "admin") {
    return next(new AppError("You are not authorised to view this appointment.", 403));
  }

  res.status(200).json({ success: true, data: { appointment } });
}

/**
 * GET /api/v1/appointments/my/stats
 * Returns status breakdown counts for the logged-in patient.
 * Lightweight — uses countDocuments instead of fetching full documents.
 */
async function getMyAppointmentStats(req, res) {
  const patientId = req.user._id;

  const [pending, approved, completed, cancelled, rejected, total] =
    await Promise.all([
      Appointment.countDocuments({ patientId, status: "pending" }),
      Appointment.countDocuments({ patientId, status: "approved" }),
      Appointment.countDocuments({ patientId, status: "completed" }),
      Appointment.countDocuments({ patientId, status: "cancelled" }),
      Appointment.countDocuments({ patientId, status: "rejected" }),
      Appointment.countDocuments({ patientId }),
    ]);

  res.status(200).json({
    success: true,
    data: { stats: { pending, approved, completed, cancelled, rejected, total } },
  });
}

module.exports = {
  bookAppointment,
  getMyAppointments,
  getMyAppointmentStats,
  cancelAppointment,
  uploadDocument,
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
  getAppointmentById,
};
