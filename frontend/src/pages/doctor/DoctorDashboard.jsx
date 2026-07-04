// =============================================================
//  pages/doctor/DoctorDashboard.jsx
// =============================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Paper, Typography, Button, Divider,
  Table, TableHead, TableRow, TableCell, TableBody, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import CalendarMonthIcon      from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon     from "@mui/icons-material/CancelOutlined";
import PendingOutlinedIcon    from "@mui/icons-material/PendingOutlined";
import TaskAltIcon            from "@mui/icons-material/TaskAlt";

import { useAuth }                from "../../context/AuthContext";
import { appointmentService }     from "../../api/services";
import StatusChip                 from "../../components/common/StatusChip";
import { SectionLoader }          from "../../components/common/Loaders";
import { PALETTE }                from "../../theme";
import dayjs                      from "dayjs";

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
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: `2px solid ${accent}33`,
            background: `${accent}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "2rem",
              color: PALETTE.inkDark,
              lineHeight: 1,
            }}
          >
            {value ?? "—"}
          </Typography>
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

export default function DoctorDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [appts, setAppts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [doctorNote, setDoctorNote]     = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppts = () => {
    setLoading(true);
    appointmentService
      .getDoctorList({ limit: 10, status: "pending" })
      .then((res) => setAppts(res.data.data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppts(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await appointmentService.approve(id);
      fetchAppts();
    } catch (e) { /* show snackbar in production */ }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await appointmentService.reject(rejectDialog.id, { doctorNote });
      setRejectDialog({ open: false, id: null });
      setDoctorNote("");
      fetchAppts();
    } catch (e) {}
    finally { setActionLoading(false); }
  };

  const pending   = appts.filter((a) => a.status === "pending").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 2 }}>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Doctor Portal — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          {greeting}, Dr. {user?.name?.split(" ")[0]}.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Manage your appointments and patient requests below.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.teal700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<PendingOutlinedIcon />}   label="Pending Requests" value={pending}  accent={PALETTE.warning} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<CalendarMonthIcon />}      label="Today's Slots"    value="—"        accent={PALETTE.teal700} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<CheckCircleOutlineIcon />} label="Completed Today"  value="—"        accent={PALETTE.success} />
        </Grid>
      </Grid>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => navigate("/doctor/appointments")}>
          All Appointments
        </Button>
        <Button variant="outlined" startIcon={<TaskAltIcon />} onClick={() => navigate("/doctor/profile")}>
          Edit Profile & Timings
        </Button>
      </Box>

      {/* Pending requests table */}
      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}`, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, background: PALETTE.inkDark, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", color: "#FFF", fontWeight: 700, fontSize: "1rem" }}>
            Pending Requests
          </Typography>
          <Typography variant="caption" sx={{ color: PALETTE.sepia200 }}>
            Review and respond to appointment requests
          </Typography>
        </Box>

        {loading ? (
          <SectionLoader />
        ) : appts.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: PALETTE.sepia200, mb: 1 }} />
            <Typography variant="body1" sx={{ color: PALETTE.inkLight }}>
              No pending requests — you're all caught up.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Document</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appts.map((appt) => (
                <TableRow key={appt._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: PALETTE.burgundy700, fontSize: "0.8rem" }}>
                        {appt.patientId?.name?.[0] || "P"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>
                          {appt.patientId?.name}
                        </Typography>
                        <Typography variant="caption">{appt.patientId?.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{dayjs(appt.date).format("DD MMM YYYY")}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{appt.timeSlot}</Typography>
                  </TableCell>
                  <TableCell>
                    {appt.documentUrl ? (
                      <Button size="small" href={`http://localhost:5000/${appt.documentUrl}`} target="_blank" sx={{ fontSize: "0.75rem" }}>
                        View
                      </Button>
                    ) : (
                      <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>None</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small" variant="contained" disabled={actionLoading}
                      onClick={() => handleApprove(appt._id)}
                      sx={{ mr: 1, fontSize: "0.75rem", py: 0.5 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small" variant="outlined" color="error" disabled={actionLoading}
                      onClick={() => setRejectDialog({ open: true, id: appt._id })}
                      sx={{ fontSize: "0.75rem", py: 0.5 }}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Decline Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: PALETTE.inkMid }}>
            Optionally provide a reason to help the patient understand.
          </Typography>
          <TextField
            fullWidth multiline rows={3}
            label="Reason (optional)"
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={actionLoading}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
