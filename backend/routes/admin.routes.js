// =============================================================
//  routes/admin.routes.js
//  Base path: /api/v1/admin
//  All routes require requireAdmin middleware.
// =============================================================

const router = require("express").Router();
const ctrl   = require("../controllers/admin.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

// Apply requireAdmin to every route in this file
router.use(requireAdmin);

// ── Dashboard ─────────────────────────────────────────────────
router.get("/stats", ctrl.getPlatformStats);

// ── User management ───────────────────────────────────────────
router.get("/users",                  ctrl.getAllUsers);
router.get("/users/:id",              ctrl.getUserById);
router.put("/users/:id/deactivate",   ctrl.deactivateUser);
router.put("/users/:id/activate",     ctrl.activateUser);

// ── Doctor application management ────────────────────────────
router.get("/doctors",                ctrl.getAllDoctors);
router.get("/doctors/pending",        ctrl.getPendingApplications);
router.put("/doctors/:id/approve",    ctrl.approveDoctor);
router.put("/doctors/:id/reject",     ctrl.rejectDoctor);

// ── Appointment oversight ─────────────────────────────────────
router.get("/appointments",           ctrl.getAllAppointments);

// ── Notification audit ────────────────────────────────────────
router.get("/notifications/:userId",  ctrl.getUserNotifications);

module.exports = router;
