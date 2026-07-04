// =============================================================
//  pages/auth/LoginPage.jsx — Neo-Vintage Redesign
// =============================================================

import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, Button,
  Link, Alert, InputAdornment, IconButton, Divider,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../../context/AuthContext";
import { PALETTE } from "../../theme";

// Role-to-dashboard routing map.
// Checks user.role first (new RBAC field), then user.type (legacy fallback).
const ROLE_REDIRECT = {
  patient: "/patient/dashboard",
  user:    "/patient/dashboard",   // legacy type value
  doctor:  "/doctor/dashboard",
  admin:   "/admin/dashboard",
};

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      // Prefer user.role (new RBAC), fall back to user.type (legacy)
      const destination = ROLE_REDIRECT[user.role] || ROLE_REDIRECT[user.type] || "/";
      const from = location.state?.from?.pathname || destination;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      // Pass the real Google ID token — backend verifies it via tokeninfo API
      const user = await googleLogin({ credential: credentialResponse.credential });
      const destination = ROLE_REDIRECT[user.role] || ROLE_REDIRECT[user.type] || "/";
      const from = location.state?.from?.pathname || destination;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Check GCP Console settings.");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: PALETTE.cream,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Decorative left panel ─────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "45%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: PALETTE.teal900,
          position: "relative",
          overflow: "hidden",
          p: 6,
        }}
      >
        {/* Decorative large text watermark */}
        <Typography
          sx={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "18vw",
            fontWeight: 700,
            color: "rgba(255,255,255,0.04)",
            userSelect: "none",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          Rx
        </Typography>

        {/* Corner decorative lines */}
        <Box sx={{
          position: "absolute", top: 24, left: 24, width: 60, height: 60,
          borderTop: `2px solid ${PALETTE.sepia200}40`,
          borderLeft: `2px solid ${PALETTE.sepia200}40`,
        }} />
        <Box sx={{
          position: "absolute", bottom: 24, right: 24, width: 60, height: 60,
          borderBottom: `2px solid ${PALETTE.sepia200}40`,
          borderRight: `2px solid ${PALETTE.sepia200}40`,
        }} />

        <Box sx={{ position: "relative", textAlign: "center", maxWidth: 320 }}>
          {/* Cross emblem */}
          <Box sx={{ position: "relative", width: 72, height: 72, mx: "auto", mb: 4 }}>
            <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: PALETTE.sepia200, transform: "translateY(-50%)" }} />
            <Box sx={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 3, background: PALETTE.sepia200, transform: "translateX(-50%)" }} />
          </Box>

          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            MedConsult
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.28em",
              color: PALETTE.sepia200,
              textTransform: "uppercase",
              mb: 4,
            }}
          >
            Est. MCMXCVIII
          </Typography>

          <Divider sx={{ borderColor: `${PALETTE.sepia200}30`, mb: 4 }} />

          <Typography
            sx={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              color: `${PALETTE.sepia200}CC`,
              fontSize: "1rem",
              lineHeight: 1.7,
            }}
          >
            "The art of medicine consists of amusing the patient while nature cures the disease."
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              color: `${PALETTE.sepia200}80`,
              mt: 2,
              textTransform: "uppercase",
            }}
          >
            — Voltaire
          </Typography>
        </Box>
      </Box>

      {/* ── Right: Login form ─────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile brand */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
            <Box sx={{ position: "relative", width: 32, height: 32 }}>
              <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: PALETTE.teal900, transform: "translateY(-50%)" }} />
              <Box sx={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: PALETTE.teal900, transform: "translateX(-50%)" }} />
            </Box>
            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", color: PALETTE.inkDark }}>
              MedConsult
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "1.85rem",
              color: PALETTE.inkDark,
              mb: 0.5,
            }}
          >
            Welcome Back
          </Typography>
          <Typography sx={{ color: PALETTE.inkLight, fontFamily: "'Lora', serif", fontStyle: "italic", mb: 3 }}>
            Sign in to access your health dashboard.
          </Typography>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: PALETTE.inkLight, letterSpacing: "0.12em" }}>
              SECURE SIGN IN
            </Typography>
          </Divider>

          {/* Google Sign-In button — real OAuth via @react-oauth/google */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              shape="rectangular"
              theme="outline"
              size="large"
              text="signin_with"
              logo_alignment="left"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Email Address" name="email" type="email" required
              value={form.email} onChange={handleChange} autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: PALETTE.inkLight, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Password" name="password" required
              type={showPass ? "text" : "password"}
              value={form.password} onChange={handleChange} autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: PALETTE.inkLight, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                      {showPass
                        ? <VisibilityOffOutlinedIcon fontSize="small" />
                        : <VisibilityOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit" variant="contained" fullWidth size="large"
              disabled={loading}
              sx={{
                py: 1.6,
                mb: 2.5,
                fontFamily: "'Lato', sans-serif",
                letterSpacing: "0.12em",
                fontSize: "0.85rem",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>

            <Typography variant="body2" align="center" sx={{ color: PALETTE.inkLight }}>
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: PALETTE.teal700,
                  fontWeight: 600,
                  textDecoration: "none",
                  borderBottom: `1px solid ${PALETTE.teal700}55`,
                  "&:hover": { borderBottomColor: PALETTE.teal700 },
                }}
              >
                Register here
              </Link>
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "0.72rem", color: PALETTE.rule, fontFamily: "'Lato', sans-serif" }}>
              Made with
            </Typography>
            <FavoriteIcon sx={{ fontSize: 10, color: PALETTE.burgundy700 }} />
            <Typography sx={{ fontSize: "0.72rem", color: PALETTE.rule, fontFamily: "'Lato', sans-serif" }}>
              for better healthcare
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
