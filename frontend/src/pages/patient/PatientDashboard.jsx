// =============================================================
//  pages/patient/PatientDashboard.jsx — Neo-Vintage Redesign
// =============================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Paper, Typography, Button, Divider,
  Table, TableHead, TableRow, TableCell, TableBody,
  Avatar, Skeleton,
} from "@mui/material";
import CalendarMonthIcon       from "@mui/icons-material/CalendarMonth";
import SearchIcon              from "@mui/icons-material/Search";
import CheckCircleOutlineIcon  from "@mui/icons-material/CheckCircleOutline";
import PendingOutlinedIcon     from "@mui/icons-material/PendingOutlined";
import AssignmentIndIcon       from "@mui/icons-material/AssignmentInd";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

import { useAuth }               from "../../context/AuthContext";
import { appointmentService }    from "../../api/services";
import StatusChip                from "../../components/common/StatusChip";
import { PALETTE }               from "../../theme";
import dayjs                     from "dayjs";

// ── Decorative ornament divider ───────────────────────────────
function OrnamentDivider() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 3 }}>
      <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
      <Typography sx={{ color: PALETTE.sepia200, fontSize: "1.2rem", lineHeight: 1 }}>✦</Typography>
      <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
    </Box>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, loading }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        border: `1px solid ${PALETTE.sepia200}`,
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 24px ${PALETTE.inkDark}14` },
      }}
    >
      {/* Top accent bar */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 52, height: 52, borderRadius: "50%",
            border: `2px solid ${accent}33`,
            background: `${accent}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: accent, flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          {loading ? (
            <Skeleton width={40} height={36} />
          ) : (
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: "2rem",
                color: PALETTE.inkDark, lineHeight: 1,
              }}
            >
              {value ?? 0}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{ color: PALETTE.inkLight, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {label}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function PatientDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  // Separate states: stats (accurate counts) + recent list (table)
  const [stats,   setStats]   = useState(null);
  const [appts,   setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both in parallel
    Promise.all([
      appointmentService.getMyStats(),
      appointmentService.getMyList({ limit: 5 }),
    ])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data.data.stats);
        setAppts(listRes.data.data.appointments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <Box sx={{ maxWidth: 1050, mx: "auto", py: 2 }}>

      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box
        sx={{
          mb: 1,
          pb: 3,
          borderBottom: `2px solid ${PALETTE.inkDark}`,
          position: "relative",
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}
        >
          Patient Portal — MedConsult
        </Typography>
        <Typography
          variant="h3"
          sx={{ mt: 0.5, fontStyle: "italic", color: PALETTE.inkDark }}
        >
          {greeting}, {user?.name?.split(" ")[0]}.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Your personal health record, managed with care.
        </Typography>

        {/* Decorative rule */}
        <Box
          sx={{
            position: "absolute", bottom: -3, left: 0,
            width: "60px", height: "4px",
            background: PALETTE.teal700,
            borderRadius: 2,
          }}
        />
      </Box>

      <OrnamentDivider />

      {/* ── Stat cards (accurate, from /my/stats) ────────────── */}
      <Typography
        variant="overline"
        sx={{ display: "block", mb: 2, letterSpacing: "0.18em", color: PALETTE.inkLight }}
      >
        — Your Appointment Summary
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<PendingOutlinedIcon />}
            label="Pending"
            value={stats?.pending}
            accent={PALETTE.warning}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<CalendarMonthIcon />}
            label="Confirmed"
            value={stats?.approved}
            accent={PALETTE.teal700}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<CheckCircleOutlineIcon />}
            label="Completed"
            value={stats?.completed}
            accent={PALETTE.success}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex", gap: 2, mb: 4, flexWrap: "wrap",
          p: 2.5,
          background: PALETTE.sepia100,
          border: `1px solid ${PALETTE.sepia200}`,
          borderRadius: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => navigate("/patient/search")}
        >
          Find a Doctor
        </Button>
        <Button
          variant="outlined"
          startIcon={<CalendarMonthIcon />}
          onClick={() => navigate("/patient/appointments")}
        >
          All Appointments
        </Button>
      </Box>

      {/* ── Recent appointments ───────────────────────────────── */}
      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}`, borderRadius: 2, overflow: "hidden" }}>
        {/* Gazette-style header */}
        <Box
          sx={{
            px: 3, py: 2,
            background: PALETTE.inkDark,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MedicalServicesOutlinedIcon sx={{ color: PALETTE.sepia200, fontSize: 20 }} />
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                color: "#FFFFFF", fontWeight: 700, fontSize: "1rem",
                letterSpacing: "0.04em",
              }}
            >
              Recent Appointments
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => navigate("/patient/appointments")}
            sx={{
              color: PALETTE.sepia200,
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.78rem",
              "&:hover": { background: "rgba(255,255,255,0.08)" },
            }}
          >
            View All →
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={52} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ) : appts.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CalendarMonthIcon sx={{ fontSize: 48, color: PALETTE.sepia200, mb: 1 }} />
            <Typography variant="body1" sx={{ color: PALETTE.inkLight }}>
              No appointments yet.
            </Typography>
            <Button
              variant="contained" size="small" sx={{ mt: 2 }}
              onClick={() => navigate("/patient/search")}
            >
              Book your first appointment
            </Button>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appts.map((appt) => {
                const doc = appt.doctorId;
                return (
                  <TableRow
                    key={appt._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate("/patient/appointments")}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {doc?.profilePhoto ? (
                          <Avatar
                            src={`${process.env.REACT_APP_API_URL?.replace("/api/v1", "")}/${doc.profilePhoto}`}
                            sx={{ width: 34, height: 34, filter: "grayscale(20%) sepia(15%)" }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 34, height: 34,
                              bgcolor: PALETTE.teal900,
                              fontFamily: "'Playfair Display', serif",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                            }}
                          >
                            {doc?.userId?.name?.[0] || "D"}
                          </Avatar>
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>
                          Dr. {doc?.userId?.name || "—"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{doc?.specialization || "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(appt.date).format("DD MMM YYYY")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>
                        {appt.timeSlot}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={appt.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ── Support & Help Section ───────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 3, mt: 4,
          background: PALETTE.parchment,
          border: `1px dashed ${PALETTE.sepia200}`,
          borderRadius: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: PALETTE.burgundy700, mb: 0.5 }}>
            Need Assistance or Dispute Help?
          </Typography>
          <Typography variant="body2" sx={{ color: PALETTE.inkMid }}>
            For scheduling changes, clinical issues, or general support, you can contact our 24/7 Support Desk at <strong>support@medconsult.com</strong> or call <strong>+1 (800) 555-0199</strong>.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          component="a"
          href="mailto:support@medconsult.com"
          sx={{ flexShrink: 0 }}
        >
          Email Support
        </Button>
      </Paper>
    </Box>
  );
}
