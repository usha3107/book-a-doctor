// =============================================================
//  components/common/ChatAvatar.jsx
//
//  Neo-Vintage "Newspaper Portrait" Avatar
//  For use next to appointment list items, messages, or any
//  context where a user's photo appears alongside text.
//
//  Props:
//    src       {string|null}  — full URL of the photo
//    name      {string}       — name for initials fallback
//    size      {number}       — diameter in px (default: 44)
//    variant   {"polaroid" | "locket" | "circle"}
//    sepia     {boolean}      — apply sepia/grayscale filter (default: true)
// =============================================================

import React from "react";
import { Box, Typography } from "@mui/material";
import { PALETTE } from "../../theme";

const AVATAR_COLORS = [
  PALETTE.teal900, PALETTE.burgundy700, "#5C6B8A",
  "#6B5B45", "#4A6B5C", "#8A5C6B",
];

function avatarBg(name = "") {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export default function ChatAvatar({
  src = null,
  name = "",
  size = 44,
  variant = "polaroid",
  sepia = true,
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const photoFilter = sepia
    ? "grayscale(30%) sepia(25%) contrast(1.08) brightness(0.97)"
    : "none";

  // ── Polaroid variant ─────────────────────────────────────
  if (variant === "polaroid") {
    const pad = Math.round(size * 0.1);
    const bottomPad = Math.round(size * 0.28);
    return (
      <Box
        title={name}
        sx={{
          position: "relative",
          width: size + pad * 2,
          padding: `${pad}px ${pad}px ${bottomPad}px ${pad}px`,
          background: "#FFFFFF",
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.2),
            inset 0 0 0 1px ${PALETTE.sepia200}
          `,
          transform: "rotate(-1deg)",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: size, height: size,
            background: src ? "transparent" : avatarBg(name),
            overflow: "hidden",
            position: "relative",
          }}
        >
          {src ? (
            <Box
              component="img"
              src={src}
              alt={name}
              sx={{
                width: "100%", height: "100%",
                objectFit: "cover",
                filter: photoFilter,
                display: "block",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: size * 0.35,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1,
                  filter: sepia ? "grayscale(20%)" : "none",
                }}
              >
                {initials || "?"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // ── Locket variant (oval with thick warm border) ─────────
  if (variant === "locket") {
    return (
      <Box
        title={name}
        sx={{
          width: size, height: size,
          borderRadius: "50%",
          border: `${Math.max(2, size * 0.07)}px solid ${PALETTE.sepia200}`,
          boxShadow: `
            0 0 0 ${Math.max(1, size * 0.03)}px ${PALETTE.sepia100},
            0 0 0 ${Math.max(2, size * 0.06)}px ${PALETTE.sepia200},
            0 3px 8px rgba(0,0,0,0.18)
          `,
          overflow: "hidden",
          background: src ? "transparent" : avatarBg(name),
          flexShrink: 0,
          position: "relative",
        }}
      >
        {src ? (
          <Box
            component="img"
            src={src}
            alt={name}
            sx={{
              width: "100%", height: "100%",
              objectFit: "cover",
              filter: photoFilter,
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: size * 0.38,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1,
              }}
            >
              {initials || "?"}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // ── Circle variant (simple, with sepia filter) ────────────
  return (
    <Box
      title={name}
      sx={{
        width: size, height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: src ? "transparent" : avatarBg(name),
        flexShrink: 0,
        border: `2px solid ${PALETTE.sepia200}`,
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={name}
          sx={{ width: "100%", height: "100%", objectFit: "cover", filter: photoFilter }}
        />
      ) : (
        <Box
          sx={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700, fontSize: size * 0.38,
              color: "rgba(255,255,255,0.9)", lineHeight: 1,
            }}
          >
            {initials || "?"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
