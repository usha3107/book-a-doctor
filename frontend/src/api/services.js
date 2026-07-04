// =============================================================
//  api/services.js — API Service Layer
//
//  One exported object per domain.  Components import only
//  what they need — no direct Axios calls in components.
// =============================================================

import axiosClient from "./axiosClient";

// ── Auth ──────────────────────────────────────────────────────
export const authService = {
  registerIntent:   (data)     => axiosClient.post("/auth/register-intent", data),
  verifyOtp:        (data)     => axiosClient.post("/auth/verify-otp", data),
  register:         (data)     => axiosClient.post("/auth/register", data),          // legacy
  registerPatient:  (data)     => axiosClient.post("/auth/register/patient", data),  // patient pipeline
  registerDoctor:   (data)     => axiosClient.post("/auth/register/doctor", data),   // doctor pipeline
  googleLogin:      (data)     => axiosClient.post("/auth/google", data),
  login:            (data)     => axiosClient.post("/auth/login", data),
  getMe:            ()         => axiosClient.get("/auth/me"),
  changePassword:   (data)     => axiosClient.put("/auth/password", data),
  updateProfile:    (data)     => axiosClient.put("/auth/profile", data),
  uploadPhoto:      (formData) => axiosClient.post("/auth/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ── Doctors ───────────────────────────────────────────────────
export const doctorService = {
  search:           (params)     => axiosClient.get("/doctors", { params }),
  getById:          (id)         => axiosClient.get(`/doctors/${id}`),
  getMyProfile:     ()           => axiosClient.get("/doctors/me/profile"),
  updateMyProfile:  (data)       => axiosClient.put("/doctors/me/profile", data),
  updateTimings:    (data)       => axiosClient.put("/doctors/me/timings", data),
  uploadPhoto:      (formData)   => axiosClient.post("/doctors/me/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ── Appointments ──────────────────────────────────────────────
export const appointmentService = {
  book:          (data)         => axiosClient.post("/appointments", data),
  getMyList:     (params)       => axiosClient.get("/appointments/my", { params }),
  getMyStats:    ()             => axiosClient.get("/appointments/my/stats"),
  getDoctorList: (params)       => axiosClient.get("/appointments/doctor", { params }),
  getById:       (id)           => axiosClient.get(`/appointments/${id}`),
  cancel:        (id, data)     => axiosClient.delete(`/appointments/${id}/cancel`, { data }),
  approve:       (id, data)     => axiosClient.put(`/appointments/${id}/approve`, data),
  reject:        (id, data)     => axiosClient.put(`/appointments/${id}/reject`, data),
  complete:      (id, data)     => axiosClient.put(`/appointments/${id}/complete`, data),
  uploadDocument:(id, formData) => axiosClient.post(`/appointments/${id}/document`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ── Notifications ─────────────────────────────────────────────
export const notificationService = {
  getAll:         (params)  => axiosClient.get("/notifications", { params }),
  getUnreadCount: ()        => axiosClient.get("/notifications/unread-count"),
  markRead:       (id)      => axiosClient.put(`/notifications/${id}/read`),
  markAllRead:    ()        => axiosClient.put("/notifications/read-all"),
  delete:         (id)      => axiosClient.delete(`/notifications/${id}`),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminService = {
  getStats:          ()           => axiosClient.get("/admin/stats"),
  getUsers:          (params)     => axiosClient.get("/admin/users", { params }),
  getUserById:       (id)         => axiosClient.get(`/admin/users/${id}`),
  deactivateUser:    (id)         => axiosClient.put(`/admin/users/${id}/deactivate`),
  activateUser:      (id)         => axiosClient.put(`/admin/users/${id}/activate`),
  getPendingDoctors: (params)     => axiosClient.get("/admin/doctors/pending", { params }),
  getAllDoctors:      (params)     => axiosClient.get("/admin/doctors", { params }),
  approveDoctor:     (id, data)   => axiosClient.put(`/admin/doctors/${id}/approve`, data),
  rejectDoctor:      (id, data)   => axiosClient.put(`/admin/doctors/${id}/reject`, data),
  getAppointments:   (params)     => axiosClient.get("/admin/appointments", { params }),
};
