// =============================================================
//  context/AuthContext.jsx — Global Authentication State
//
//  Provides:
//    user       — current User document (or null)
//    token      — raw JWT string (or null)
//    isLoading  — true while verifying token on first load
//    login(data)    — POST credentials, store token + user
//    logout()       — clear state and redirect
//    refreshUser()  — re-fetch /auth/me (e.g. after role change)
// =============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { authService } from "../api/services";
import { registerUnauthorizedHandler } from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // ── On mount: validate stored token ──────────────────────
  useEffect(() => {
    // Bind Axios 401 callback to clean React state
    registerUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
    });

    if (initialized.current) return;
    initialized.current = true;

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((res) => {
        setUser(res.data.data.user);
        setToken(storedToken);
      })
      .catch(() => {
        // Token is stale or invalid — clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── login ─────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { token: newToken, data } = res.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(data.user);

    return data.user; // caller can redirect based on user.type
  }, []);

  // ── register ──────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    const res = await authService.register(payload);
    const { token: newToken, data } = res.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(data.user);

    return data.user;
  }, []);

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    // Full page reload clears any cached state in children
    window.location.replace("/login");
  }, []);

  // ── googleLogin ───────────────────────────────────────────
  const googleLogin = useCallback(async (payload) => {
    const res = await authService.googleLogin(payload);
    const { token: newToken, data } = res.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(data.user);

    return data.user;
  }, []);

  // ── refreshUser — re-fetch profile (e.g. after doctor approval) ─
  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.data.user);
    } catch {
      logout();
    }
  }, [logout]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Custom hook ───────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
