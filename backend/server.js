// =============================================================
//  server.js — Application Entry Point
//
//  Boot sequence:
//    1. Load environment variables (.env)
//    2. Instantiate Express app
//    3. Mount enterprise-grade security middleware (Helmet, CORS)
//    4. Mount body parsers and request logger
//    5. Mount static file serving for uploads
//    6. Mount API route handlers (Phase 3 onwards)
//    7. Mount global 404 and error-handling middleware
//    8. Connect to MongoDB
//    9. Start HTTP server
//
//  Security notes:
//    • Helmet sets 15+ security-related HTTP headers automatically
//    • CORS is configured with an explicit allow-list; credentials
//      are NOT allowed by default (JWT in Authorization header only)
//    • express-async-errors patches Express so async controller
//      errors propagate to the global error handler without
//      requiring try/catch in every function
// =============================================================

// ── 0. Patch async error propagation FIRST ───────────────────
// Must be required before any route/controller definitions.
require("express-async-errors");

// ── 1. Environment variables ──────────────────────────────────
require("dotenv").config();

// ── 2. Core dependencies ──────────────────────────────────────
const express  = require("express");
const helmet   = require("helmet");
const cors     = require("cors");
const morgan   = require("morgan");
const path     = require("path");

// ── 3. Internal modules ───────────────────────────────────────
const connectDB                   = require("./config/db");
const { errorHandler, AppError }  = require("./utils/errorHandler");

// ── 4. Route imports ──────────────────────────────────────────
const authRoutes         = require("./routes/auth.routes");
const doctorRoutes       = require("./routes/doctor.routes");
const appointmentRoutes  = require("./routes/appointment.routes");
const notificationRoutes = require("./routes/notification.routes");
const adminRoutes        = require("./routes/admin.routes");

// ── 5. Create Express app ─────────────────────────────────────
const app = express();

// ── 6. Security middleware ────────────────────────────────────

/**
 * Helmet — sets HTTP security headers.
 *   contentSecurityPolicy, crossOriginEmbedderPolicy,
 *   dnsPrefetchControl, frameguard (X-Frame-Options),
 *   hidePoweredBy, hsts, ieNoOpen, noSniff, permittedCrossDomainPolicies,
 *   referrerPolicy, xssFilter … and more.
 */
app.use(helmet());

/**
 * CORS — allow only the client origin defined in .env.
 * For development you may set CLIENT_ORIGIN=http://localhost:3000.
 * Multiple origins can be separated by commas.
 */
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin requests (origin === undefined) and Postman
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new AppError(`CORS: Origin ${origin} is not allowed.`, 403));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // We use Bearer tokens; no cookies needed
  })
);

// ── 7. Body parsers ───────────────────────────────────────────
// Limit payload size to prevent DoS via oversized JSON body.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── 8. Request logger ─────────────────────────────────────────
// `dev` format in development; `combined` (Apache) in production.
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── 9. Static files — uploaded medical documents ─────────────
// Files stored by multer are served under /uploads/<date>/<filename>.
// In production, consider serving these via a CDN or signed URLs instead.
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
app.use(
  `/${UPLOAD_DIR}`,
  express.static(path.join(__dirname, UPLOAD_DIR), {
    // Browsers should not cache medical documents
    setHeaders(res) {
      res.setHeader("Cache-Control", "no-store");
    },
  })
);

// ── 10. Health check ──────────────────────────────────────────
// Simple liveness probe for load balancers and uptime monitors.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Book-A-Doctor API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 11. API routes ─────────────────────────────────────────────
// All routes are namespaced under /api/v1 for versioning.
app.use("/api/v1/auth",          authRoutes);
app.use("/api/v1/doctors",       doctorRoutes);
app.use("/api/v1/appointments",  appointmentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin",         adminRoutes);

// ── 12. 404 handler — unknown routes ─────────────────────────
// Must come AFTER all valid route registrations.
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// ── 13. Global error handler ──────────────────────────────────
// Must come LAST — 4-argument signature is Express convention.
app.use(errorHandler);

// ── 14. Bootstrap ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;

async function bootstrap() {
  // Connect to DB first; exit on permanent failure (handled in connectDB)
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `[Server] ✓ Book-A-Doctor API listening on port ${PORT} ` +
      `(${process.env.NODE_ENV || "development"})`
    );
  });

  // ── Graceful shutdown ────────────────────────────────────────
  // Allows in-flight requests to complete before closing connections.
  const shutdown = (signal) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully…`);
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      console.log("[Server] ✓ HTTP server and MongoDB connection closed.");
      process.exit(0);
    });

    // Force-kill after 10 s if graceful shutdown hangs
    setTimeout(() => {
      console.error("[Server] ✗ Graceful shutdown timed out. Force exiting.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  // Handle unhandled promise rejections (shouldn't happen with async-errors
  // patch, but belt-and-suspenders)
  process.on("unhandledRejection", (reason) => {
    console.error("[Server] ✗ Unhandled Rejection:", reason);
    shutdown("unhandledRejection");
  });
}

bootstrap();

// Export app for testing (Supertest / Jest)
module.exports = app;
