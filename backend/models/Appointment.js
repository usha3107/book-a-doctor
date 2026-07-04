// =============================================================
//  models/Appointment.js — Appointment Booking & Lifecycle Model
//
//  Responsibilities:
//    • Record every booking between a patient (User) and a Doctor
//    • Track the full approval lifecycle (pending → approved/rejected/completed)
//    • Store an optional medical document URL uploaded via multer
//    • Use dayjs-compatible date storage (ISO strings in Date type)
//    • Compound indexes optimise the two most common queries:
//        1.  "All appointments for a given patient"
//        2.  "All appointments for a given doctor"
// =============================================================

const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // ── Participants ───────────────────────────────────────────
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },

    // ── Scheduling ─────────────────────────────────────────────
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
      validate: {
        validator(v) {
          // Appointments cannot be booked in the past
          return v >= new Date(new Date().setHours(0, 0, 0, 0));
        },
        message: "Appointment date cannot be in the past",
      },
    },

    // The specific time slot string, e.g. "09:00 - 09:30"
    // Derived from Doctor.timings at booking time; stored here for
    // historical accuracy even if the doctor later changes timings.
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
    },

    // ── Medical document ──────────────────────────────────────
    // Relative path (or CDN URL) set by multer after file upload.
    // null means no document was attached.
    documentUrl: {
      type: String,
      default: null,
    },

    // ── Patient notes ─────────────────────────────────────────
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
      default: null,
    },

    // ── Lifecycle status ───────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "completed", "cancelled", "rejected"],
        message: "`{VALUE}` is not a valid appointment status",
      },
      default: "pending",
    },

    // Optional note from the doctor explaining a rejection or extra context
    doctorNote: {
      type: String,
      trim: true,
      maxlength: [500, "Doctor note cannot exceed 500 characters"],
      default: null,
    },

    // ── Doctor Clinical Inputs (Visit Summaries & Recommendations) ───
    visitSummary: {
      type: String,
      trim: true,
      maxlength: [2000, "Visit summary cannot exceed 2000 characters"],
      default: null,
    },

    recommendations: {
      type: String,
      trim: true,
      maxlength: [2000, "Recommendations cannot exceed 2000 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
    toObject: { versionKey: false },
  }
);

// ── Indexes ──────────────────────────────────────────────────

// Patient dashboard: "Show me all my appointments, newest first"
appointmentSchema.index({ patientId: 1, createdAt: -1 });

// Doctor dashboard: "Show me all pending/approved appointments for today"
appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });

// Admin view: full audit trail sorted chronologically
appointmentSchema.index({ status: 1, createdAt: -1 });

// Prevent double-booking: same doctor + date + timeslot can only be 'pending'
// or 'approved' once. (Partial unique index — only active bookings matter.)
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
    name: "no_double_booking",
  }
);

// ── Model export ─────────────────────────────────────────────
const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
