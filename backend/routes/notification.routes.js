// =============================================================
//  routes/notification.routes.js
//  Base path: /api/v1/notifications
//  All routes require a valid JWT (requireAuth).
// =============================================================

const router = require("express").Router();
const ctrl   = require("../controllers/notification.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.use(requireAuth);

// ── Read-all must be registered BEFORE /:id to avoid route collision ─
router.put("/read-all",    ctrl.markAllAsRead);
router.get("/unread-count", ctrl.getUnreadCount);

router.get("/",            ctrl.getMyNotifications);
router.put("/:id/read",    ctrl.markAsRead);
router.delete("/:id",      ctrl.deleteNotification);

module.exports = router;
