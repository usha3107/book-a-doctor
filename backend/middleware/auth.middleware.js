// =============================================================
//  middleware/auth.middleware.js — Authentication & RBAC Guards
//
//  Exports:
//    requireAuth          — verifies JWT (Bearer header), attaches req.user
//    requireUser          — requireAuth + role must be 'patient'
//    requireDoctor        — requireAuth + role must be 'doctor'
//    requireAdmin         — requireAuth + role must be 'admin'
//    requireAnyOf(...)    — factory for multi-role guards
//    authenticateJWT      — alias for requireAuth; reads token from header OR cookie
//    authorizeRoles(...)  — factory middleware: checks req.user.role vs allowedRoles
//    requireVerification  — ensures req.user.isVerified === true (doctors only)
//
//  Usage:
//    router.get('/profile',      requireAuth,              controller.getProfile);
//    router.post('/apply',       requireUser,              doctorCtrl.applyAsDoctor);
//    router.get('/admin/users',  requireAdmin,             adminCtrl.getAllUsers);
//    router.get('/consult',      authenticateJWT,
//                                authorizeRoles('doctor'),
//                                requireVerification,      ctrl.providerRoute);
//
//  Security notes:
//    • Token is expected in the Authorization header as a Bearer token.
//    • We re-fetch the user from the DB on every protected request to
//      ensure the account still exists and hasn't been deactivated.
//    • The `password` field is explicitly excluded from the DB query.
// =============================================================

const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");
const { AppError } = require("../utils/errorHandler");

// ── Helper: extract Bearer token from header ─────────────────
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const parts = authHeader.split(" ");
    if (parts.length === 2) {
      return parts[1];
    }
  }
  return null;
}

// ── Core: verify JWT and attach req.user ──────────────────────
/**
 * requireAuth
 *
 * 1. Pulls the JWT from Authorization: Bearer <token>
 * 2. Verifies the signature + expiry with try/catch mapping
 * 3. Loads the User document (without password hash)
 * 4. Checks the account is active
 * 5. Attaches the document to req.user and calls next()
 */
async function requireAuth(req, res, next) {
  // 1. Extract token safely
  const token = extractToken(req);
  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to gain access.",
        401
      )
    );
  }

  try {
    // 2. Verify signature and expiry safely
    const decoded = verifyToken(token);

    // 3. Confirm the user still exists in the database
    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return next(
        new AppError(
          "The account belonging to this token no longer exists.",
          401
        )
      );
    }

    // 4. Confirm the account is active (not soft-deleted)
    if (!currentUser.isActive) {
      return next(
        new AppError("Your account has been deactivated. Please contact support.", 403)
      );
    }

    // 5. Attach to request and proceed
    req.user = currentUser;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please log in again.", 401));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid or tampered session token. Access denied.", 401));
    }
    return next(new AppError("Authentication failed. Please log in again.", 401));
  }
}

// ── Role guards ───────────────────────────────────────────────

/**
 * requireUser
 * Allows standard patients. Doctors and admins are intentionally
 * blocked here — they use their own dashboards.
 * (Admins calling patient endpoints must switch accounts.)
 */
async function requireUser(req, res, next) {
  await requireAuth(req, res, async (err) => {
    if (err) return next(err);
    if (req.user.role !== "patient") {
      return next(
        new AppError(
          "This action is restricted to patient accounts.",
          403
        )
      );
    }
    return next();
  });
}

/**
 * requireDoctor
 * Allows only approved doctor accounts.
 */
async function requireDoctor(req, res, next) {
  await requireAuth(req, res, async (err) => {
    if (err) return next(err);
    if (req.user.role !== "doctor") {
      return next(
        new AppError(
          "This action is restricted to verified doctor accounts.",
          403
        )
      );
    }
    return next();
  });
}

/**
 * requireAdmin
 * Allows only admin accounts.
 */
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async (err) => {
    if (err) return next(err);
    if (req.user.role !== "admin") {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          403
        )
      );
    }
    return next();
  });
}

/**
 * requireAnyOf
 * Factory that accepts multiple roles — useful for shared endpoints.
 * e.g. requireAnyOf('doctor', 'admin')
 *
 * @param  {...string} roles
 * @returns Express middleware
 */
function requireAnyOf(...roles) {
  return async function (req, res, next) {
    await requireAuth(req, res, (err) => {
      if (err) return next(err);
      const normalizedRoles = roles.map(r => r === "user" ? "patient" : r);
      if (!normalizedRoles.includes(req.user.role)) {
        return next(
          new AppError(
            `This action requires one of the following roles: ${roles.join(", ")}.`,
            403
          )
        );
      }
      return next();
    });
  };
}


// =============================================================
//  authenticateJWT
//  Industry-standard alias for requireAuth.
//  Accepts token from:
//    1. Authorization: Bearer <token>   (API clients, SPAs)
//    2. req.cookies.token               (cookie-based sessions)
//  Attaches the full Mongoose User document to req.user.
// =============================================================
async function authenticateJWT(req, res, next) {
  // Try cookie first (browser sessions), then Authorization header
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else {
    token = extractToken(req);
  }

  if (!token) {
    return next(
      new AppError(
        "Access denied. No authentication token provided. Please log in.",
        401
      )
    );
  }

  try {
    const decoded = verifyToken(token);

    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return next(
        new AppError(
          "The account belonging to this token no longer exists.",
          401
        )
      );
    }

    if (!currentUser.isActive) {
      return next(
        new AppError(
          "Your account has been deactivated. Please contact support.",
          403
        )
      );
    }

    req.user = currentUser;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError("Your session has expired. Please log in again.", 401)
      );
    }
    if (err.name === "JsonWebTokenError") {
      return next(
        new AppError("Invalid or tampered session token. Access denied.", 401)
      );
    }
    return next(new AppError("Authentication failed. Please log in again.", 401));
  }
}

// =============================================================
//  authorizeRoles(...allowedRoles)
//  Factory middleware — restricts access to specified roles.
//
//  Usage:
//    router.get('/admin/stats', authenticateJWT, authorizeRoles('admin'), ctrl);
//    router.get('/consult',     authenticateJWT, authorizeRoles('doctor', 'admin'), ctrl);
//
//  Accepts legacy 'user' in the list and normalises it to 'patient'.
// =============================================================
function authorizeRoles(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication required. Please run authenticateJWT before authorizeRoles.",
          401
        )
      );
    }

    // Normalise legacy 'user' → 'patient' for backward compatibility
    const normalised = allowedRoles.map((r) => (r === "user" ? "patient" : r));

    if (!normalised.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(" or ")}. Your role: ${req.user.role}.`,
          403
        )
      );
    }

    return next();
  };
}

// =============================================================
//  requireVerification
//  Ensures a doctor's profile has been verified by an admin.
//  Must be used AFTER authenticateJWT or requireAuth.
//
//  Usage:
//    router.get('/provider/schedule',
//      authenticateJWT,
//      authorizeRoles('doctor'),
//      requireVerification,
//      scheduleCtrl.getSchedule
//    );
// =============================================================
function requireVerification(req, res, next) {
  if (!req.user) {
    return next(
      new AppError(
        "Authentication required. Please run authenticateJWT before requireVerification.",
        401
      )
    );
  }

  if (req.user.isVerified !== true) {
    return next(
      new AppError(
        "Access denied. Your provider account is pending admin verification. " +
          "You will be notified by email once approved.",
        403
      )
    );
  }

  return next();
}

module.exports = {
  requireAuth,
  requireUser,
  requireDoctor,
  requireAdmin,
  requireAnyOf,
  authenticateJWT,
  authorizeRoles,
  requireVerification,
};
