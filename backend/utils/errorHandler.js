// =============================================================
//  utils/errorHandler.js — Global Error Handling Utilities
//
//  Exports:
//    • AppError     — custom Error subclass with HTTP status
//    • errorHandler — Express global error-handling middleware
//
//  Design decisions:
//    • Operational errors (AppError) include a friendly message
//      returned to the client.
//    • Programming/unknown errors log the full stack in development
//      but return a generic "Internal Server Error" in production
//      to avoid leaking implementation details.
// =============================================================

// ── Custom error class ────────────────────────────────────────
/**
 * AppError
 *
 * Extend this for any expected, "operational" error (bad input,
 * not found, forbidden, etc.). The `statusCode` maps directly
 * to an HTTP response status.
 *
 * Usage:
 *   throw new AppError("Doctor not found", 404);
 *   throw new AppError("You are not authorised to do this", 403);
 */
class AppError extends Error {
  /**
   * @param {string} message  — human-readable error description
   * @param {number} statusCode — HTTP status code (4xx or 5xx)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Mark as operational so the global handler knows it is safe
    // to send the message to the client.
    this.isOperational = true;

    // Capture a clean stack trace (excludes this constructor frame)
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Mongoose / third-party error translators ─────────────────

function handleCastError(err) {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
}

function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  const value = err.keyValue?.[field];
  return new AppError(
    `Duplicate value for ${field}: "${value}". Please use a different value.`,
    409
  );
}

function handleValidationError(err) {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join(". ")}`, 400);
}

function handleJWTError() {
  return new AppError("Invalid token. Please log in again.", 401);
}

function handleJWTExpiredError() {
  return new AppError("Your session has expired. Please log in again.", 401);
}

function handleMulterError(err) {
  if (err.code === "LIMIT_FILE_SIZE") {
    const maxMB = process.env.MAX_FILE_SIZE_MB || 5;
    return new AppError(`File is too large. Maximum allowed size is ${maxMB} MB.`, 400);
  }
  return new AppError(`File upload error: ${err.message}`, 400);
}

// ── Development error response (verbose) ─────────────────────
function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

// ── Production error response (minimal) ──────────────────────
function sendErrorProd(err, res) {
  if (err.isOperational) {
    // Trusted, expected error — safe to expose details
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // Unknown / programming error — log but don't expose internals
  console.error("UNEXPECTED ERROR 🔥", err);
  return res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
}

// ── Global error-handling middleware ─────────────────────────
/**
 * errorHandler
 *
 * Must be registered LAST in the Express middleware chain:
 *   app.use(errorHandler);
 *
 * Four-argument signature is required by Express to identify
 * this as an error-handling middleware.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const isDev = process.env.NODE_ENV === "development";

  // Translate known Mongoose / library errors in ALL environments so that
  // friendly messages are returned even during development.
  let translatedErr = err;

  if (err.name === "CastError") {
    translatedErr = handleCastError(err);
  } else if (err.code === 11000) {
    translatedErr = handleDuplicateKeyError(err);
  } else if (err.name === "ValidationError") {
    translatedErr = handleValidationError(err);
  } else if (err.name === "JsonWebTokenError") {
    translatedErr = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    translatedErr = handleJWTExpiredError();
  } else if (err.name === "MulterError") {
    translatedErr = handleMulterError(err);
  }

  if (isDev) {
    // In development, always send full details (stack + raw error)
    return sendErrorDev(translatedErr, res);
  }

  return sendErrorProd(translatedErr, res);
}

module.exports = { AppError, errorHandler };
