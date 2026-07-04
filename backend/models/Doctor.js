// =============================================================
//  models/Doctor.js — Doctor Profile & Availability Model
//
//  Responsibilities:
//    • Extend a User document with professional/clinical data
//    • Track the admin-approval lifecycle (pending → approved/rejected)
//    • Store available time slots as a structured array
//    • Use compound indexes to make specialization + location search
//      queries fast even at scale
// =============================================================

const mongoose = require("mongoose");

// ── Sub-schema: a single available time slot ─────────────────
// Stored as an embedded array so we can query/filter slots in
// a single document fetch rather than a join.
const timingSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "Day of the week is required"],
      enum: {
        values: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        message: "`{VALUE}` is not a valid day",
      },
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      // Format validated in the controller (HH:MM 24-hour), e.g. "09:00"
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
  },
  { _id: false } // subdocuments don't need their own _id
);

// ── Main Doctor Schema ────────────────────────────────────────
const doctorSchema = new mongoose.Schema(
  {
    // ── Owner reference ────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A doctor profile must be linked to a user account"],
      unique: true, // one doctor profile per user
    },

    // ── Professional details ───────────────────────────────────
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      maxlength: [100, "Specialization cannot exceed 100 characters"],
    },

    location: {
      type: String,
      required: [true, "Practice location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },

    experience: {
      type: Number,
      required: [true, "Years of experience are required"],
      min: [0, "Experience cannot be negative"],
      max: [60, "Experience value seems unrealistically high"],
    },

    // Consultation fee in the application's default currency (e.g. USD)
    fees: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Fee cannot be negative"],
    },

    // Professional bio / summary shown on the doctor profile card
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },

    // Profile photo URL (e.g. stored via multer or a CDN)
    profilePhoto: {
      type: String,
      default: null,
    },

    // ── Availability ───────────────────────────────────────────
    timings: {
      type: [timingSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one time slot must be provided",
      },
    },

    // ── Admin approval lifecycle ───────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "`{VALUE}` is not a valid status",
      },
      default: "pending",
    },

    // Optional note from the admin explaining a rejection
    adminNote: {
      type: String,
      trim: true,
      maxlength: [500, "Admin note cannot exceed 500 characters"],
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

// Primary patient-facing search: find approved doctors by specialty in a city
doctorSchema.index({ specialization: 1, location: 1, status: 1 });

// Secondary search: browse all approved doctors sorted by fee
doctorSchema.index({ status: 1, fees: 1 });

// Admin panel: filter by approval status chronologically
doctorSchema.index({ status: 1, createdAt: -1 });

// ── Model export ─────────────────────────────────────────────
const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
