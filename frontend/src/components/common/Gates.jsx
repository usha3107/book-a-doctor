// =============================================================
//  components/common/Gates.jsx — Reusable Security Gates
// =============================================================

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { PALETTE } from "../../theme";

export function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PALETTE.cream,
      }}
    >
      <CircularProgress sx={{ color: PALETTE.teal700 }} size={48} thickness={3} />
    </Box>
  );
}

/**
 * LoadingGate
 * Suspends rendering of children until initial authentication context hydration resolves.
 */
export function LoadingGate({ children }) {
  const { isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return children;
}

/**
 * AuthGate
 * Declarative gating that redirects unauthenticated requests to the login screen.
 */
export function AuthGate({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
