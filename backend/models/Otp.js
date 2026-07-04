// =============================================================
//  models/Otp.js — OTP Verification Code Schema
// =============================================================

const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: "register",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expiresAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
