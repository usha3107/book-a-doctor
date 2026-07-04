// =============================================================
//  routes/appointment.routes.js
//  Base path: /api/v1/appointments
// =============================================================

const router = require("express").Router();
const ctrl   = require("../controllers/appointment.controller");
const upload = require("../config/multer");
const {
  requireAuth,
  requireUser,
  requireDoctor,
} = require("../middleware/auth.middleware");

// ── Patient routes ────────────────────────────────────────────
router.post("/",              requireUser,   ctrl.bookAppointment);
router.get( "/my",            requireUser,   ctrl.getMyAppointments);
// Stats must come BEFORE /:id to avoid route-param shadowing
router.get( "/my/stats",      requireUser,   ctrl.getMyAppointmentStats);
router.delete("/:id/cancel",  requireUser,   ctrl.cancelAppointment);

// Document upload — multer.single('document') processes the multipart body,
// then the controller reads req.file
router.post(
  "/:id/document",
  requireUser,
  upload.single("document"),
  ctrl.uploadDocument
);

// ── Doctor routes ─────────────────────────────────────────────
router.get("/doctor",           requireDoctor, ctrl.getDoctorAppointments);
router.put("/:id/approve",      requireDoctor, ctrl.approveAppointment);
router.put("/:id/reject",       requireDoctor, ctrl.rejectAppointment);
router.put("/:id/complete",     requireDoctor, ctrl.completeAppointment);

// ── Shared (patient OR doctor OR admin) ───────────────────────
router.get("/:id", requireAuth, ctrl.getAppointmentById);

module.exports = router;
