// =============================================================
//  components/common/ProtectedRoute.jsx
//
//  Usage:
//    <ProtectedRoute>           — any authenticated user
//    <ProtectedRoute role="doctor">  — authenticated + role match
//
//  Shows a loading spinner while AuthContext resolves the token.
//  Redirects to /login if unauthenticated, or /unauthorized if
//  the role doesn't match.
// =============================================================

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingGate, AuthGate } from "./Gates";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  return (
    <LoadingGate>
      <AuthGate>
        {role && user?.type !== role ? (
          <Navigate to="/unauthorized" replace />
        ) : (
          children
        )}
      </AuthGate>
    </LoadingGate>
  );
}
