// =============================================================
//  App.jsx — Root Component & Complete Route Tree (Phase 7)
// =============================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme             from "./theme";
import { AuthProvider }  from "./context/AuthContext";
import ProtectedRoute    from "./components/common/ProtectedRoute";
import MinimalistLayout  from "./components/layout/MinimalistLayout";

// ── Auth ──────────────────────────────────────────────────────
import LoginPage           from "./pages/auth/LoginPage";
import RegisterPage        from "./pages/auth/RegisterPage";
import { UnauthorizedPage, NotFoundPage } from "./pages/auth/ErrorPages";

// ── Patient ───────────────────────────────────────────────────
import PatientDashboard    from "./pages/patient/PatientDashboard";
import DoctorSearchPage    from "./pages/patient/DoctorSearchPage";
import AppointmentsPage    from "./pages/patient/AppointmentsPage";
import PatientProfilePage  from "./pages/patient/PatientProfilePage";

// ── Doctor ────────────────────────────────────────────────────
import DoctorDashboard         from "./pages/doctor/DoctorDashboard";
import DoctorAppointmentsPage  from "./pages/doctor/DoctorAppointmentsPage";
import DoctorProfilePage       from "./pages/doctor/DoctorProfilePage";

// ── Admin ─────────────────────────────────────────────────────
import AdminDashboard          from "./pages/admin/AdminDashboard";
import AdminUsersPage          from "./pages/admin/AdminUsersPage";
import AdminDoctorsPage        from "./pages/admin/AdminDoctorsPage";
import AdminAppointmentsPage   from "./pages/admin/AdminAppointmentsPage";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public */}
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/register"     element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Patient (type: user) */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute role="user">
                  <MinimalistLayout />
                </ProtectedRoute>
              }
            >
              <Route index                 element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"      element={<PatientDashboard />} />
              <Route path="search"         element={<DoctorSearchPage />} />
              <Route path="appointments"   element={<AppointmentsPage />} />
              <Route path="profile"        element={<PatientProfilePage />} />
            </Route>

            {/* Doctor (type: doctor) */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute role="doctor">
                  <MinimalistLayout />
                </ProtectedRoute>
              }
            >
              <Route index                 element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"      element={<DoctorDashboard />} />
              <Route path="appointments"   element={<DoctorAppointmentsPage />} />
              <Route path="profile"        element={<DoctorProfilePage />} />
            </Route>

            {/* Admin (type: admin) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <MinimalistLayout />
                </ProtectedRoute>
              }
            >
              <Route index                 element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"      element={<AdminDashboard />} />
              <Route path="users"          element={<AdminUsersPage />} />
              <Route path="doctors"        element={<AdminDoctorsPage />} />
              <Route path="appointments"   element={<AdminAppointmentsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
