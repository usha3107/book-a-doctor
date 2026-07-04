// =============================================================
//  pages/auth/UnauthorizedPage.jsx
// =============================================================

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BlockIcon from "@mui/icons-material/Block";
import { PALETTE } from "../../theme";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: PALETTE.cream, textAlign: "center", p: 3 }}>
      <BlockIcon sx={{ fontSize: 72, color: PALETTE.sepia200, mb: 2 }} />
      <Typography variant="h2" sx={{ mb: 1 }}>Access Denied</Typography>
      <Typography variant="body1" sx={{ mb: 3, color: PALETTE.inkLight, maxWidth: 400 }}>
        You don't have permission to view this page. Please contact support if you believe this is an error.
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
    </Box>
  );
}

// =============================================================
//  pages/NotFoundPage.jsx
// =============================================================

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: PALETTE.cream, textAlign: "center", p: 3 }}>
      <Typography variant="h1" sx={{ fontSize: "6rem", color: PALETTE.sepia200, fontWeight: 700, lineHeight: 1 }}>404</Typography>
      <Typography variant="h3" sx={{ mb: 1, mt: 1 }}>Page Not Found</Typography>
      <Typography variant="body1" sx={{ mb: 3, color: PALETTE.inkLight }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>Return Home</Button>
    </Box>
  );
}
