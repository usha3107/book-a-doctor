// =============================================================
//  utils/jwt.js — JSON Web Token Utilities
//
//  Centralises all JWT logic so the secret and signing options
//  are defined in exactly one place.  Controllers call these
//  helpers rather than calling jsonwebtoken directly.
//
//  Token payload contract:
//    {
//      id:   <User._id as string>,
//      type: <'user' | 'doctor' | 'admin'>
//    }
//
//  The payload is intentionally minimal — we only cache what
//  the RBAC middleware needs.  All other profile data is fetched
//  from the DB on demand.
// =============================================================

const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");

// ── Signing secret validation ────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== "test") {
  console.error("================================================================");
  console.error("[CRITICAL] JWT_SECRET is not configured in environment variables!");
  console.error("================================================================");
  process.exit(1);
}

// ── Signing options ───────────────────────────────────────────
const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * signToken
 * Creates and signs a JWT for a given user document.
 *
 * Payload contract:
 *   { id, type, role, isVerified }
 *
 * @param {Object} user — Mongoose User document (or plain object with _id + role)
 * @returns {string} signed JWT
 */
function signToken(user) {
  return jwt.sign(
    {
      id:         user._id.toString(),
      type:       user.type,
      role:       user.role,
      isVerified: !!user.isVerified,
    },
    JWT_SECRET || "fallback_secret_for_tests",
    {
      expiresIn: DEFAULT_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
}

/**
 * verifyToken
 * Synchronously verifies and decodes a JWT.
 * Throws JsonWebTokenError or TokenExpiredError on failure
 * (these are caught and translated by the global error handler).
 *
 * @param {string} token
 * @returns {{ id: string, type: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET || "fallback_secret_for_tests");
}

/**
 * createSendToken
 * Convenience helper used by auth controllers to:
 *   1. Sign a fresh token
 *   2. Strip the password hash from the response body
 *   3. Send the standardised JSON response
 *
 * @param {Document} user     — Mongoose User document
 * @param {number}   statusCode
 * @param {Object}   res      — Express response object
 */
function createSendToken(user, statusCode, res) {
  const token = signToken(user);

  // toObject() triggers the schema transform that removes `password`
  const userObj = user.toObject();

  res.status(statusCode).json({
    success: true,
    token,
    data: { user: userObj },
  });
}

module.exports = { signToken, verifyToken, createSendToken };
