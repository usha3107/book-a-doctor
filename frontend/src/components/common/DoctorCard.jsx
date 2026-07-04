// =============================================================
//  components/common/DoctorCard.jsx — Neo-Vintage Polaroid Design
//
//  Props:
//    doctor   {Doctor document populated with userId}
//    onBook   {(doctor) => void}  — called when Book button clicked
// =============================================================

import React from "react";
import {
  Card, CardContent, CardActions, Box, Typography,
  Button, Chip, Divider, Tooltip,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkOutlineIcon        from "@mui/icons-material/WorkOutline";
import AttachMoneyIcon        from "@mui/icons-material/AttachMoney";
import AccessTimeIcon         from "@mui/icons-material/AccessTime";

import ChatAvatar  from "./ChatAvatar";
import { PALETTE } from "../../theme";

const API_BASE = process.env.REACT_APP_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

export default function DoctorCard({ doctor, onBook }) {
  const user   = doctor?.userId || {};
  const name   = user.name || "Doctor";
  const photoSrc = doctor?.profilePhoto ? `${API_BASE}/${doctor.profilePhoto}` : null;

  // Unique days available
  const availableDays = [...new Set((doctor.timings || []).map((t) => t.day.slice(0, 3)))];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 16px 36px ${PALETTE.inkDark}1A`,
        },
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${PALETTE.teal900}, ${PALETTE.teal700}88)`,
          borderRadius: "4px 4px 0 0",
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Doctor identity — polaroid avatar + name */}
        <Box sx={{ display: "flex", gap: 2, mb: 2.5, alignItems: "flex-start" }}>
          <ChatAvatar
            src={photoSrc}
            name={name}
            size={60}
            variant="polaroid"
          />
          <Box sx={{ overflow: "hidden", pt: 0.5 }}>
            <Typography
              variant="h5"
              sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              Dr. {name}
            </Typography>
            <Chip
              label={doctor.specialization}
              size="small"
              sx={{
                mt: 0.75,
                background: PALETTE.teal50,
                color: PALETTE.teal900,
                border: `1px solid ${PALETTE.teal100}`,
                fontFamily: "'Lato', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                borderRadius: 1,
                height: 22,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 15, color: PALETTE.inkLight, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: PALETTE.inkMid }}>
              {doctor.location}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WorkOutlineIcon sx={{ fontSize: 15, color: PALETTE.inkLight, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: PALETTE.inkMid }}>
              {doctor.experience} years experience
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AttachMoneyIcon sx={{ fontSize: 15, color: PALETTE.inkLight, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: PALETTE.inkMid }}>
              <strong style={{ color: PALETTE.inkDark, fontFamily: "'Playfair Display', serif" }}>
                ${doctor.fees}
              </strong>{" "}
              per consultation
            </Typography>
          </Box>
        </Box>

        {/* Bio excerpt */}
        {doctor.bio && (
          <Typography
            variant="body2"
            sx={{
              mt: 2, color: PALETTE.inkLight,
              fontStyle: "italic",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              borderLeft: `2px solid ${PALETTE.sepia200}`,
              pl: 1.25,
            }}
          >
            {doctor.bio}
          </Typography>
        )}

        {/* Available days */}
        {availableDays.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
              <AccessTimeIcon sx={{ fontSize: 12, color: PALETTE.inkLight }} />
              <Typography variant="caption" sx={{ color: PALETTE.inkLight, letterSpacing: "0.1em" }}>
                AVAILABLE
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {availableDays.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  size="small"
                  sx={{
                    height: 20,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "0.68rem",
                    background: PALETTE.sepia100,
                    color: PALETTE.inkMid,
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ px: 3, py: 1.75, justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => onBook && onBook(doctor)}
          sx={{
            px: 3,
            fontFamily: "'Lato', sans-serif",
            letterSpacing: "0.08em",
            fontSize: "0.78rem",
          }}
        >
          Book Appointment
        </Button>
      </CardActions>
    </Card>
  );
}
