// =============================================================
//  routes/doctor.routes.js
//  Base path: /api/v1/doctors
// =============================================================

const router = require("express").Router();
const ctrl   = require("../controllers/doctor.controller");
const upload = require("../config/multer");
const { requireAuth, requireUser, requireDoctor } =
  require("../middleware/auth.middleware");

// ── Public ────────────────────────────────────────────────────
// GET /api/v1/doctors?specialization=&location=&minFee=&maxFee=
router.get("/",    ctrl.searchDoctors);

// ── Doctor self-management (order matters: /me/** before /:id) ─
router.get( "/me/profile",  requireDoctor, ctrl.getMyDoctorProfile);
router.put( "/me/profile",  requireDoctor, ctrl.updateDoctorProfile);
router.put( "/me/timings",  requireDoctor, ctrl.updateTimings);
router.post("/me/photo",    requireDoctor, upload.single("photo"), ctrl.uploadProfilePhoto);

// ── Public — single doctor (must come LAST to avoid matching /apply) ─
router.get("/:id", ctrl.getDoctorById);

module.exports = router;
