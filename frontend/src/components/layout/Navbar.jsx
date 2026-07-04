// =============================================================
//  components/layout/Navbar.jsx — Dedicated Minimalist Header
// =============================================================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../api/services";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const userType = user?.type || "user";

  // ── Notifications State ─────────────────────────────────────
  const [unreadCount, setUnreadCount]     = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [notifLoading, setNotifLoading]   = useState(false);

  // Poll unread count on mount and every 60 s
  useEffect(() => {
    if (!user) return;
    const fetchCount = () =>
      notificationService
        .getUnreadCount()
        .then((res) => setUnreadCount(res.data.data.count))
        .catch(() => {});

    fetchCount();
    const id = setInterval(fetchCount, 60_000);
    return () => clearInterval(id);
  }, [user]);

  const toggleNotifs = async () => {
    const next = !showNotifs;
    setShowNotifs(next);
    if (next) {
      setNotifLoading(true);
      try {
        const res = await notificationService.getAll({ limit: 10 });
        setNotifications(res.data.data.notifications || []);
      } catch (_) {
        /* silent */
      } finally {
        setNotifLoading(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {
      /* silent */
    }
  };

  if (!user) return null;

  return (
    <header className="layout-header">

      {/* ── Brand Logo ─────────────────────────────────────── */}
      <div className="brand-section">
        <Link to="/" className="brand-logo">
          MedConsult
        </Link>
      </div>

      {/* ── Right Controls ─────────────────────────────────── */}
      <nav className="top-nav" aria-label="Main Navigation">
        <div className="user-profile-menu">

          {/* Authenticated user identity */}
          <span className="user-name-display">
            {user.name}&nbsp;
            <span className="user-role-badge">({userType.toUpperCase()})</span>
          </span>

          {/* Alerts toggle */}
          <button
            id="navbar-alerts-btn"
            type="button"
            onClick={toggleNotifs}
            className="notif-btn"
            aria-expanded={showNotifs}
            aria-haspopup="true"
          >
            ALERTS{unreadCount > 0 ? ` [${unreadCount}]` : ""}
          </button>

          {/* Logout */}
          <button
            id="navbar-logout-btn"
            type="button"
            onClick={logout}
            className="logout-btn"
          >
            LOG OUT
          </button>
        </div>
      </nav>

      {/* ── Notification Dropdown ───────────────────────────── */}
      {showNotifs && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications">

          <div className="notif-dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="mark-read-btn"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifLoading ? (
            <div className="notif-empty">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">No alerts found.</div>
          ) : (
            <ul className="notif-dropdown-list">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`notif-dropdown-item${!n.isRead ? " unread" : ""}`}
                >
                  <div className="notif-message">{n.message}</div>
                  <span className="notif-time">
                    {new Date(n.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </header>
  );
}
