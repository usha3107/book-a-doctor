// =============================================================
//  components/layout/MinimalistLayout.jsx — Top Header & Border Layout
// =============================================================

import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MinimalistTabs from "./MinimalistTabs";
import Navbar from "./Navbar";
import "./MinimalistLayout.css";

// ── Define tabs per role type ──────────────────────────────────
const ROLE_TABS = {
  user: [
    { id: "dashboard",    label: "Dashboard",       path: "/patient/dashboard" },
    { id: "search",       label: "Find a Doctor",   path: "/patient/search" },
    { id: "appointments", label: "Appointments",    path: "/patient/appointments" },
    { id: "profile",      label: "My Profile",      path: "/patient/profile" },
  ],
  doctor: [
    { id: "dashboard",    label: "Dashboard",       path: "/doctor/dashboard" },
    { id: "appointments", label: "Appointments",    path: "/doctor/appointments" },
    { id: "profile",      label: "My Profile",      path: "/doctor/profile" },
  ],
  admin: [
    { id: "dashboard",    label: "Dashboard",       path: "/admin/dashboard" },
    { id: "users",        label: "Users List",      path: "/admin/users" },
    { id: "doctors",      label: "Applications",    path: "/admin/doctors" },
    { id: "appointments", label: "Appointments",    path: "/admin/appointments" },
  ],
};

/**
 * MinimalistLayout
 * A premium, border-driven minimalist layout wrapper.
 * Integrates notification polling, stateful dropdowns, and Outlet rendering.
 */
export default function MinimalistLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userType = user?.type || "user";
  const tabs = ROLE_TABS[userType] || [];

  // Determine active tab based on path matching
  const activeTab = tabs.find((t) => location.pathname.startsWith(t.path))?.id || "";

  const handleTabChange = (tabId) => {
    const matchedTab = tabs.find((t) => t.id === tabId);
    if (matchedTab) {
      navigate(matchedTab.path);
    }
  };

  return (
    <div className="layout-container">
      {/* ── Semantic Top Header ───────────────────────────────── */}
      <Navbar />

      {/* ── Main Layout Body ──────────────────────────────────── */}
      <main className="layout-main">
        {tabs.length > 0 && (
          <section className="tab-section">
            <MinimalistTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={handleTabChange}
            />
          </section>
        )}

        {/* Content panel matching WAI-ARIA tabpanel */}
        <section 
          id={`tab-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={activeTab ? `tab-control-${activeTab}` : undefined}
          className="content-area"
        >
          {children || <Outlet />}
        </section>
      </main>
    </div>
  );
}
