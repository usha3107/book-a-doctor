// =============================================================
//  api/axiosClient.js — Centralised Axios Instance
//
//  • Base URL reads from REACT_APP_API_URL env var
//  • Request interceptor: attaches JWT from localStorage
//  • Response interceptor: normalises errors, handles 401 auto-logout
// =============================================================

import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor — attach Bearer token ─────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalise errors ───────────────────
let onUnauthorizedCallback = null;

export function registerUnauthorizedHandler(callback) {
  onUnauthorizedCallback = callback;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401, clear stale credentials and redirect to login —
    // BUT only if the user is NOT already on an auth page.
    if (error.response?.status === 401) {
      const publicPaths = ["/login", "/register"];
      const isPublicPage = publicPaths.some((p) =>
        window.location.pathname.startsWith(p)
      );
      if (!isPublicPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        } else {
          // Use replace so the user can't navigate back (fallback)
          window.location.replace("/login");
        }
      }
    }

    // Attach a clean message so callers don't need to dig
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
