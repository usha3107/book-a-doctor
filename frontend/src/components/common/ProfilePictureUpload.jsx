// =============================================================
//  components/common/ProfilePictureUpload.jsx
//
//  Neo-Vintage Profile Picture Upload Component
//
//  Features:
//    • Hidden file input, custom mechanical-switch styled button
//    • Instant client-side preview using FileReader
//    • Client-side validation: images only, max 2 MB
//    • Polaroid/locket-frame preview with vintage CSS filter
//    • FormData packaging + POST to API
//    • Works for both patients (POST /auth/photo) and
//      doctors (POST /doctors/me/photo) — pass the right serviceFn
//
//  Props:
//    currentPhoto  {string|null}  — existing photo URL (relative server path)
//    serviceFn     {function}     — e.g. authService.uploadPhoto or doctorService.uploadPhoto
//    onSuccess     {function}     — called with updated user/doctor object after upload
//    userName      {string}       — used for initials fallback
// =============================================================

import React, { useRef, useState, useCallback } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { PALETTE } from "../../theme";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const API_BASE = process.env.REACT_APP_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

export default function ProfilePictureUpload({
  currentPhoto = null,
  serviceFn,
  onSuccess,
  userName = "",
}) {
  const inputRef      = useRef(null);
  const [preview,     setPreview]   = useState(null);
  const [selectedFile,setFile]      = useState(null);
  const [error,       setError]     = useState("");
  const [success,     setSuccess]   = useState("");
  const [uploading,   setUploading] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ── File selection & preview ───────────────────────────────
  const handleFileChange = useCallback((e) => {
    setError(""); setSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Invalid file type. Please select a JPEG, PNG, or WebP image.");
      return;
    }
    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setError("File is too large. Maximum allowed size is 2 MB.");
      return;
    }

    setFile(file);

    // Instant preview via FileReader
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  // ── Upload ─────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile || !serviceFn) return;
    setUploading(true);
    setError(""); setSuccess("");

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      const res = await serviceFn(formData);
      const updated = res.data.data.user || res.data.data.doctor;
      setSuccess("Profile picture updated successfully!");
      setPreview(null);
      setFile(null);
      if (onSuccess) onSuccess(updated);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const displaySrc = preview || (currentPhoto ? `${API_BASE}/${currentPhoto}` : null);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2.5,
        p: 3,
        background: PALETTE.parchment,
        border: `1px solid ${PALETTE.sepia200}`,
        borderRadius: 2,
        maxWidth: 300,
        mx: "auto",
      }}
    >
      {/* ── Label ─────────────────────────────────────────── */}
      <Typography
        sx={{
          fontFamily: "'Lato', sans-serif",
          fontSize: "0.68rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: PALETTE.inkLight,
          alignSelf: "flex-start",
        }}
      >
        — Profile Portrait
      </Typography>

      {/* ── Polaroid / Locket Frame ────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          width: 160,
          // Polaroid proportions: wider bottom border for caption strip
          padding: "10px 10px 28px 10px",
          background: "#FFFFFF",
          boxShadow: `
            0 2px 8px rgba(0,0,0,0.18),
            0 6px 20px rgba(0,0,0,0.12),
            inset 0 0 0 1px ${PALETTE.sepia200}
          `,
          // Subtle rotation for vintage feel
          transform: "rotate(-1.5deg)",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "rotate(0deg) scale(1.02)" },
        }}
      >
        {/* Photo or initials */}
        <Box
          sx={{
            width: "100%",
            paddingTop: "100%", // 1:1 square
            position: "relative",
            background: displaySrc ? "transparent" : PALETTE.teal900,
            overflow: "hidden",
          }}
        >
          {displaySrc ? (
            <Box
              component="img"
              src={displaySrc}
              alt="Profile"
              sx={{
                position: "absolute",
                top: 0, left: 0, width: "100%", height: "100%",
                objectFit: "cover",
                // Vintage photo treatment
                filter: preview
                  ? "grayscale(20%) sepia(20%) contrast(1.05)"
                  : "grayscale(15%) sepia(15%) contrast(1.05)",
                transition: "filter 0.4s",
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                top: 0, left: 0, width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1,
                }}
              >
                {initials || "?"}
              </Typography>
            </Box>
          )}

          {/* Uploading overlay */}
          {uploading && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CircularProgress size={32} sx={{ color: "#FFF" }} />
            </Box>
          )}
        </Box>

        {/* Polaroid caption strip */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              color: PALETTE.inkLight,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            {preview ? "Preview" : userName.split(" ")[0] || "Portrait"}
          </Typography>
        </Box>
      </Box>

      {/* ── Hidden file input ──────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
        // Reset so same file can be re-selected
        onClick={(e) => { e.target.value = ""; }}
      />

      {/* ── Mechanical Switch button ───────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, width: "100%" }}>
        {/* Select file — styled like a tactile mechanical switch */}
        <Box
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.25,
            px: 2,
            cursor: "pointer",
            userSelect: "none",
            // Switch body
            background: `linear-gradient(180deg, ${PALETTE.sepia100} 0%, ${PALETTE.sepia200} 100%)`,
            border: `1.5px solid ${PALETTE.sepia200}`,
            borderRadius: 1,
            // 3D press effect via layered box-shadows
            boxShadow: `
              0 4px 0 ${PALETTE.inkLight}66,
              0 5px 6px rgba(0,0,0,0.2),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
            transition: "all 0.1s ease",
            "&:active": {
              transform: "translateY(3px)",
              boxShadow: `
                0 1px 0 ${PALETTE.inkLight}66,
                0 2px 3px rgba(0,0,0,0.2),
                inset 0 1px 0 rgba(255,255,255,0.4)
              `,
            },
            "&:hover": {
              background: `linear-gradient(180deg, ${PALETTE.parchment} 0%, ${PALETTE.sepia100} 100%)`,
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: PALETTE.inkMid,
            }}
          >
            ⊕ Select Photo
          </Typography>
        </Box>

        {/* Upload / confirm button — only shown when a file is selected */}
        {selectedFile && (
          <Box
            onClick={handleUpload}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleUpload()}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1.25,
              px: 2,
              cursor: uploading ? "not-allowed" : "pointer",
              userSelect: "none",
              background: `linear-gradient(180deg, ${PALETTE.teal700} 0%, ${PALETTE.teal900} 100%)`,
              border: `1.5px solid ${PALETTE.teal900}`,
              borderRadius: 1,
              boxShadow: `
                0 4px 0 ${PALETTE.teal900},
                0 5px 6px rgba(0,0,0,0.25),
                inset 0 1px 0 rgba(255,255,255,0.15)
              `,
              transition: "all 0.1s ease",
              "&:active": {
                transform: "translateY(3px)",
                boxShadow: `0 1px 0 ${PALETTE.teal900}, inset 0 1px 0 rgba(255,255,255,0.1)`,
              },
            }}
          >
            {uploading ? (
              <CircularProgress size={14} sx={{ color: "#FFF" }} />
            ) : (
              <CheckIcon sx={{ color: "#FFF", fontSize: 16 }} />
            )}
            <Typography
              sx={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#FFFFFF",
              }}
            >
              {uploading ? "Uploading…" : "Save Photo"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Feedback messages ──────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ width: "100%", py: 0.5, fontSize: "0.78rem" }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ width: "100%", py: 0.5, fontSize: "0.78rem" }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Typography
        sx={{
          fontSize: "0.68rem",
          color: PALETTE.rule,
          fontFamily: "'Lato', sans-serif",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Accepted: JPEG, PNG, WebP · Max 2 MB
      </Typography>
    </Box>
  );
}
