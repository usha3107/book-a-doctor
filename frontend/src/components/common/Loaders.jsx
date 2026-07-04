// =============================================================
//  components/common/Loaders.jsx — Reusable loading states
// =============================================================

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { PALETTE } from "../../theme";

export function PageLoader({ message = "Loading…" }) {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: PALETTE.teal700 }} size={44} thickness={3} />
      <Typography variant="caption" sx={{ color: PALETTE.inkLight, letterSpacing: "0.1em" }}>
        {message.toUpperCase()}
      </Typography>
    </Box>
  );
}

export function SectionLoader() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress sx={{ color: PALETTE.teal700 }} size={32} thickness={3} />
    </Box>
  );
}
