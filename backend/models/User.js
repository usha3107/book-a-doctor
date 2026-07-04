// =============================================================
//  models/User.js — Core Authentication & Role Model
//
//  Responsibilities:
//    • Store credentials (email, hashed password) for all actors
//    • Distinguish roles via the `type` enum field
//    • Hash passwords automatically via a pre-save hook (bcrypt)
//    • Expose a `comparePassword` instance method for auth checks
//    • Never return the raw password hash via toJSON / toObject
// =============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BCRYPT_SALT_ROUNDS = 12; // industry-standard work factor (2024)

// ── Schema definition ────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,          // enforced at DB level (see index below)
      lowercase: true,       // normalise before storage
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      // `select: false` ensures the hash is never returned by default
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      match: [
        /^\+?[\d\s\-().]{7,20}$/,
        "Please provide a valid phone number",
      ],
    },

    // ── Role / Access Level ────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ["patient", "doctor", "admin"],
        message: '`{VALUE}` is not a valid user role',
      },
      default: "patient",
    },

    type: {
      type: String,
      enum: {
        values: ["user", "doctor", "admin"],
        message: '`{VALUE}` is not a valid user type',
      },
      default: "user",
    },


    // ── Verification status ───────────────────────────────────
    // For doctors: set to true only by an admin approving their application.
    // For patients: defaults to true (no clinical verification required).
    // For admins: always true.
    // Used by the requireVerification middleware.
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ── Soft-delete / account status ─────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Doctor Professional Fields ────────────────────────────
    // Only populated when role === 'doctor'. Optional on the User document;
    // the full professional profile (timings, fees, bio) lives in Doctor.js.
    specialty: {
      type: String,
      trim: true,
      maxlength: [100, "Specialty cannot exceed 100 characters"],
      default: null,
    },

    licenseNumber: {
      type: String,
      trim: true,
      maxlength: [60, "License number cannot exceed 60 characters"],
      default: null,
    },

    clinicAddress: {
      type: String,
      trim: true,
      maxlength: [250, "Clinic address cannot exceed 250 characters"],
      default: null,
    },

    // ── Profile picture ──────────────────────────────────────
    // Relative URL path from the uploads static directory.
    // null means no photo uploaded; frontend uses initials avatar as fallback.
    profilePhoto: {
      type: String,
      default: null,
    },

    // ── Personal & Medical Profile (Patient Record Storage) ───
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other", "Prefer not to say"],
        message: "`{VALUE}` is not a valid gender option",
      },
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    bloodGroup: {
      type: String,
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message: "`{VALUE}` is not a valid blood group",
      },
      default: null,
    },

    allergies: {
      type: String,
      default: null,
    },

    medicalHistory: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
    // Remove __v from API responses; strip password hash on serialisation
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      versionKey: false,
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────
// email is already indexed via `unique: true`.
// Additional index to support admin queries filtered by user type/role.
userSchema.index({ type: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });   // chronological listing

// ── Pre-save hook — role/type sync ──────────────────────────
userSchema.pre("save", function syncRoleAndType(next) {
  if (this.isModified("role")) {
    if (this.role === "patient") this.type = "user";
    else this.type = this.role;
  } else if (this.isModified("type")) {
    if (this.type === "user") this.role = "patient";
    else this.role = this.type;
  }
  next();
});


// ── Pre-save hook — password hashing ────────────────────────
/**
 * Only re-hash if the `password` field was actually modified.
 * This prevents double-hashing when other fields are updated.
 */
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// ── Instance methods ─────────────────────────────────────────

/**
 * comparePassword
 * Safely compares a plain-text candidate with the stored hash.
 * Must be called on a document fetched with `.select("+password")`.
 *
 * @param {string} candidatePassword — plain text from login form
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Model export ─────────────────────────────────────────────
const User = mongoose.model("User", userSchema);
module.exports = User;
