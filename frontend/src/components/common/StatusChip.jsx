// =============================================================
//  components/common/StatusChip.jsx
//  Renders a styled Chip for appointment or doctor statuses.
// =============================================================

import React from "react";
import { Chip } from "@mui/material";
import { PALETTE } from "../../theme";

// alpha isn't available outside MUI here — inline it
function alpha(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

const STATUS_CONFIG = {
  // Appointment statuses
  pending:   { label: "Pending",   bg: PALETTE.goldLight,             color: PALETTE.warning     },
  approved:  { label: "Approved",  bg: alpha(PALETTE.success, 0.1),   color: PALETTE.success     },
  completed: { label: "Completed", bg: PALETTE.teal50,                color: PALETTE.teal900     },
  cancelled: { label: "Cancelled", bg: PALETTE.sepia100,              color: PALETTE.inkLight    },
  rejected:  { label: "Rejected",  bg: PALETTE.burgundy50,            color: PALETTE.burgundy700 },
  // Doctor statuses
  approved_doc: { label: "Approved", bg: alpha(PALETTE.success, 0.1), color: PALETTE.success },
};

export default function StatusChip({ status, size = "small" }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    bg:    PALETTE.sepia100,
    color: PALETTE.inkMid,
  };

  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{
        background:   cfg.bg,
        color:        cfg.color,
        border:       `1px solid ${cfg.color}33`,
        fontFamily:   "'Lato', sans-serif",
        fontWeight:   700,
        fontSize:     "0.72rem",
        letterSpacing:"0.06em",
        textTransform:"uppercase",
        borderRadius: 2,
        height:       24,
      }}
    />
  );
}
