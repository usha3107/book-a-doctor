// =============================================================
//  controllers/notification.controller.js
//
//  Endpoints (mounted at /api/v1/notifications):
//
//  All require requireAuth. Users may only access their own
//  notifications — the userId filter is always set to req.user._id.
//
//    GET   /          → getMyNotifications
//    GET   /unread-count → getUnreadCount
//    PUT   /:id/read  → markAsRead
//    PUT   /read-all  → markAllAsRead
//    DELETE /:id      → deleteNotification
// =============================================================

const Notification = require("../models/Notification");
const { AppError }  = require("../utils/errorHandler");

/**
 * GET /api/v1/notifications
 * Returns the current user's notifications, newest first.
 * Supports ?isRead=true|false filter and pagination.
 */
async function getMyNotifications(req, res) {
  const { isRead, page = 1, limit = 20 } = req.query;

  const filter = { userId: req.user._id };
  if (isRead !== undefined) filter.isRead = isRead === "true";

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { notifications },
  });
}

/**
 * GET /api/v1/notifications/unread-count
 * Lightweight count used by the frontend bell badge.
 */
async function getUnreadCount(req, res) {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });
  res.status(200).json({ success: true, data: { count } });
}

/**
 * PUT /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
async function markAsRead(req, res, next) {
  const notification = await Notification.findById(req.params.id);

  if (!notification) return next(new AppError("Notification not found.", 404));

  // Ownership guard
  if (notification.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not authorised to update this notification.", 403));
  }

  if (notification.isRead) {
    // Already read — return 200 without writing to DB
    return res.status(200).json({ success: true, data: { notification } });
  }

  notification.isRead = true; // pre-save hook sets readAt
  await notification.save();

  res.status(200).json({ success: true, data: { notification } });
}

/**
 * PUT /api/v1/notifications/read-all
 * Bulk marks all unread notifications for the current user as read.
 */
async function markAllAsRead(req, res) {
  const now = new Date();

  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notification(s) marked as read.`,
    data: { modifiedCount: result.modifiedCount },
  });
}

/**
 * DELETE /api/v1/notifications/:id
 * Deletes a single notification (user-initiated cleanup).
 */
async function deleteNotification(req, res, next) {
  const notification = await Notification.findById(req.params.id);

  if (!notification) return next(new AppError("Notification not found.", 404));

  if (notification.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not authorised to delete this notification.", 403));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: "Notification deleted.",
    data: null,
  });
}

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
