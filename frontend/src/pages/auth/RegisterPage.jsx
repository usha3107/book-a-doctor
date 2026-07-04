// =============================================================
//  pages/auth/RegisterPage.jsx — Neo-Vintage Redesign
// =============================================================

import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button,
  Link, Alert, InputAdornment, IconButton, Divider,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { useAuth } from "../../context/AuthContext";
import { PALETTE } from "../../theme";

import { authService } from "../../api/services";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Wizard state: 1 = Details, 2 = OTP Code, 3 = Password setting
  const [step, setStep] = useState(1);

  // Registration pipeline: 'patient' | 'doctor'
  const [registrationType, setRegistrationType] = useState("patient");

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    // Doctor-specific fields
    specialty: "", licenseNumber: "", clinicAddress: "",
  });
  const [otp, setOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Password rules validation helper
  const meetsLength  = form.password.length >= 8;
  const meetsUpper   = /[A-Z]/.test(form.password);
  const meetsLower   = /[a-z]/.test(form.password);
  const meetsNumber  = /\d/.test(form.password);
  const meetsSpecial = /[@$!%*?&]/.test(form.password);

  const isPasswordValid = meetsLength && meetsUpper && meetsLower && meetsNumber && meetsSpecial;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const isDoctor = registrationType === "doctor";

  // Step 1: Submit Details & Request OTP Code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const emailStr = form.email.toLowerCase().trim();
    if (!emailStr.endsWith("@gmail.com")) {
      setError("Only official @gmail.com accounts are permitted.");
      return;
    }

    if (!form.name) {
      setError("Full name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.registerIntent(form);
      setSuccessMsg(res.data.message || "OTP code sent to email.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp({ email: form.email, code: otp });
      setSuccessMsg(res.data.message || "Email verified successfully.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password & Finalize Account Creation
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isPasswordValid) {
      setError("Please ensure password meets all criteria before submitting.");
      setLoading(false);
      return;
    }

    try {
      if (isDoctor) {
        // Doctor pipeline — calls /auth/register/doctor
        const res = await authService.registerDoctor({ ...form, code: otp });
        const { token, data } = res.data;
        localStorage.setItem("token", token);
        // Redirect to doctor dashboard with a pending-verification notice
        navigate("/doctor/dashboard");
      } else {
        // Patient pipeline — calls /auth/register/patient (or legacy /auth/register)
        const user = await register({ ...form, code: otp });
        navigate("/patient/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to complete registration.");
    } finally {
      setLoading(false);
    }
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
          width: "40%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(175deg, ${PALETTE.burgundy900} 0%, ${PALETTE.burgundy700} 60%, ${PALETTE.teal900} 100%)`,
          position: "relative",
          overflow: "hidden",
          p: 5,
        }}
      >
        {/* Large watermark */}
        <Typography
          sx={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "16vw", fontWeight: 700,
            color: "rgba(255,255,255,0.04)",
            userSelect: "none", whiteSpace: "nowrap", lineHeight: 1,
          }}
        >
          Rx
        </Typography>

        <Box sx={{
          position: "absolute", top: 24, left: 24, width: 50, height: 50,
          borderTop: `2px solid rgba(255,255,255,0.15)`,
          borderLeft: `2px solid rgba(255,255,255,0.15)`,
        }} />
        <Box sx={{
          position: "absolute", bottom: 24, right: 24, width: 50, height: 50,
          borderBottom: `2px solid rgba(255,255,255,0.15)`,
          borderRight: `2px solid rgba(255,255,255,0.15)`,
        }} />

        <Box sx={{ position: "relative", textAlign: "center", maxWidth: 280 }}>
          <Box sx={{ position: "relative", width: 60, height: 60, mx: "auto", mb: 3 }}>
            <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.5)", transform: "translateY(-50%)" }} />
            <Box sx={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 3, background: "rgba(255,255,255,0.5)", transform: "translateX(-50%)" }} />
          </Box>

          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem", fontWeight: 700,
              color: "#FFFFFF", lineHeight: 1.2, mb: 1,
            }}
          >
            Join MedConsult
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.68rem", letterSpacing: "0.26em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase", mb: 4,
            }}
          >
            Est. MCMXCVIII
          </Typography>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 4 }} />

          {[
            "Access verified specialist doctors",
            "Manage all your appointments",
            "Secure, confidential health records",
          ].map((text, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, textAlign: "left" }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
              <Typography
                sx={{
                  fontFamily: "'Lora', serif",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.88rem",
                  lineHeight: 1.4,
                }}
              >
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right: Registration form ──────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440, py: 4 }}>
          {/* Mobile brand */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
            <Box sx={{ position: "relative", width: 30, height: 30 }}>
              <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: PALETTE.burgundy700, transform: "translateY(-50%)" }} />
              <Box sx={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: PALETTE.burgundy700, transform: "translateX(-50%)" }} />
            </Box>
            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", color: PALETTE.inkDark }}>
              MedConsult
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700, fontSize: "1.85rem",
              color: PALETTE.inkDark, mb: 0.5,
            }}
          >
            Create Account
          </Typography>
          <Typography sx={{ color: PALETTE.inkLight, fontFamily: "'Lora', serif", fontStyle: "italic", mb: 3 }}>
            Trusted care, close to home — join the community.
          </Typography>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: PALETTE.inkLight, letterSpacing: "0.12em" }}>
              STEP {step} OF 3:{" "}
              {step === 1 ? "PERSONAL DETAILS" : step === 2 ? "EMAIL VERIFICATION" : "PASSWORD ASSIGNMENT"}
            </Typography>
          </Divider>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {successMsg && (
            <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccessMsg("")}>
              {successMsg}
            </Alert>
          )}

          {/* Step 1: Input details */}
          {step === 1 && (
            <Box component="form" onSubmit={handleRequestOtp} noValidate>

              {/* ─── Registration type toggle ────────────────────────────
                Two border-only buttons — zero new colors, uses the existing
                palette tokens already applied throughout the form.
              ───────────────────────────────────────────────── */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block", mb: 1,
                    fontWeight: 700, letterSpacing: "0.08em",
                    color: PALETTE.inkLight,
                    fontFamily: "'Lato', sans-serif",
                  }}
                >
                  ACCOUNT TYPE
                </Typography>
                <Box sx={{ display: "flex", border: `1px solid ${PALETTE.rule}`, borderRadius: 1, overflow: "hidden" }}>
                  {["patient", "doctor"].map((rt) => (
                    <Box
                      key={rt}
                      component="button"
                      type="button"
                      onClick={() => setRegistrationType(rt)}
                      sx={{
                        flex: 1, py: 1, px: 2,
                        cursor: "pointer",
                        border: "none",
                        borderRight: rt === "patient" ? `1px solid ${PALETTE.rule}` : "none",
                        background: registrationType === rt ? PALETTE.sepia100 : "transparent",
                        fontFamily: "'Lato', sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: registrationType === rt ? 700 : 400,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: registrationType === rt ? PALETTE.teal900 : PALETTE.inkLight,
                        outline: registrationType === rt ? `2px solid ${PALETTE.teal700}` : "none",
                        outlineOffset: -2,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {rt === "patient" ? "Patient" : "Doctor / Provider"}
                    </Box>
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth label="Full Name" name="name" required
                value={form.name} onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: PALETTE.inkLight, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth label="Gmail Address" name="email" type="email" required
                value={form.email} onChange={handleChange}
                helperText="Must be a valid @gmail.com account"
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
                fullWidth label="Phone Number (optional)" name="phone"
                value={form.phone} onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color: PALETTE.inkLight, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: isDoctor ? 2 : 3 }}
              />

              {/* Doctor-specific professional fields — shown only for doctor pipeline */}
              {isDoctor && (
                <>
                  <TextField
                    fullWidth label="Medical Specialty" name="specialty" required
                    value={form.specialty} onChange={handleChange}
                    placeholder="e.g. Cardiology, General Medicine"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth label="Medical License Number" name="licenseNumber" required
                    value={form.licenseNumber} onChange={handleChange}
                    placeholder="e.g. MED-2024-00123"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth label="Clinic Address (optional)" name="clinicAddress"
                    value={form.clinicAddress} onChange={handleChange}
                    placeholder="e.g. 123 Main St, New York"
                    sx={{ mb: 3 }}
                  />
                </>
              )}

              <Button
                type="submit" variant="contained" color="secondary" fullWidth size="large"
                disabled={loading}
                sx={{
                  py: 1.6, mb: 2.5,
                  fontFamily: "'Lato', sans-serif",
                  letterSpacing: "0.12em",
                  fontSize: "0.85rem",
                }}
              >
                {loading ? "Sending Code…" : "Send Verification Code"}
              </Button>
            </Box>
          )}

          {/* Step 2: Code Verification */}
          {step === 2 && (
            <Box component="form" onSubmit={handleVerifyOtp} noValidate>
              <Typography variant="body2" sx={{ color: PALETTE.inkMid, mb: 2, fontFamily: "'Lora', serif" }}>
                A 6-digit verification code has been dispatched to <strong>{form.email}</strong>. Please check your inbox and paste it below.
              </Typography>

              <TextField
                fullWidth label="Verification OTP Code" name="otp" required
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: PALETTE.inkLight, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit" variant="contained" color="secondary" fullWidth size="large"
                disabled={loading}
                sx={{
                  py: 1.6, mb: 2,
                  fontFamily: "'Lato', sans-serif",
                  letterSpacing: "0.12em",
                  fontSize: "0.85rem",
                }}
              >
                {loading ? "Verifying Code…" : "Verify OTP Code"}
              </Button>

              <Button
                fullWidth variant="outlined" size="large"
                onClick={() => setStep(1)}
                sx={{
                  py: 1.6, mb: 2.5,
                  borderColor: PALETTE.rule,
                  color: PALETTE.inkDark,
                  fontFamily: "'Lato', sans-serif",
                  letterSpacing: "0.12em",
                  fontSize: "0.85rem",
                }}
              >
                Go Back
              </Button>
            </Box>
          )}

          {/* Step 3: Password setting */}
          {step === 3 && (
            <Box component="form" onSubmit={handleCompleteRegistration} noValidate>
              <TextField
                fullWidth label="Setup Password" name="password" required
                type={showPass ? "text" : "password"}
                value={form.password} onChange={handleChange}
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
                sx={{ mb: 2 }}
              />

              {/* Password complexity indicators */}
              <Box sx={{ mb: 3, p: 2, border: `1px solid ${PALETTE.rule}`, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, letterSpacing: "0.08em", color: PALETTE.inkLight }}>
                  PASSWORD SECURITY CHECKLIST
                </Typography>
                {[
                  { label: "Minimum 8 characters", checked: meetsLength },
                  { label: "At least one uppercase letter (A-Z)", checked: meetsUpper },
                  { label: "At least one lowercase letter (a-z)", checked: meetsLower },
                  { label: "At least one numeric digit (0-9)", checked: meetsNumber },
                  { label: "At least one special character (@, $, !, %, *, ?, &)", checked: meetsSpecial },
                ].map((rule, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontFamily: "'Lato', sans-serif",
                        color: rule.checked ? PALETTE.teal700 : PALETTE.inkLight,
                        fontWeight: rule.checked ? 600 : 400,
                        transition: "color 0.2s ease",
                      }}
                    >
                      {rule.checked ? "✓" : "•"} {rule.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button
                type="submit" variant="contained" color="secondary" fullWidth size="large"
                disabled={loading || !isPasswordValid}
                sx={{
                  py: 1.6, mb: 2.5,
                  fontFamily: "'Lato', sans-serif",
                  letterSpacing: "0.12em",
                  fontSize: "0.85rem",
                }}
              >
                {loading ? "Registering…" : "Complete Registration"}
              </Button>
            </Box>
          )}

          <Typography variant="body2" align="center" sx={{ color: PALETTE.inkLight }}>
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: PALETTE.teal700,
                fontWeight: 600,
                textDecoration: "none",
                borderBottom: `1px solid ${PALETTE.teal700}55`,
                "&:hover": { borderBottomColor: PALETTE.teal700 },
              }}
            >
              Sign in
            </Link>
          </Typography>

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
