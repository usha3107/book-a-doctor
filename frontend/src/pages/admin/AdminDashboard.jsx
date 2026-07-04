// =============================================================
//  pages/admin/AdminDashboard.jsx — Neo-Vintage Redesign
// =============================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Paper, Typography, Button, Divider,
  Table, TableHead, TableRow, TableCell, TableBody,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Skeleton,
} from "@mui/material";
import PeopleOutlineIcon     from "@mui/icons-material/PeopleOutline";
import LocalHospitalIcon     from "@mui/icons-material/LocalHospital";
import AssignmentIndIcon     from "@mui/icons-material/AssignmentInd";
import CalendarMonthIcon     from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BarChartIcon          from "@mui/icons-material/BarChart";

import { adminService }    from "../../api/services";
import { SectionLoader }   from "../../components/common/Loaders";
import { PALETTE }         from "../../theme";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, sub, loading }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        border: `1px solid ${PALETTE.sepia200}`,
        borderRadius: 2,
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 24px ${PALETTE.inkDark}14` },
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <Box sx={{ p: 2.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          {loading ? (
            <Skeleton width={60} height={42} />
          ) : (
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: "2.2rem",
                color: PALETTE.inkDark, lineHeight: 1,
              }}
            >
              {value ?? "—"}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{ color: PALETTE.inkLight, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {label}
          </Typography>
          {sub && (
            <Typography variant="body2" sx={{ mt: 0.5, color: PALETTE.warning, fontSize: "0.78rem" }}>
              {sub}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: accent, opacity: 0.6, mt: 0.5 }}>{icon}</Box>
      </Box>
    </Paper>
  );
}

// ── Rejection Dialog ──────────────────────────────────────────
function RejectionDialog({ open, doctorName, onClose, onConfirm }) {
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    onConfirm(note);
    setNote("");
  };

  const handleClose = () => {
    setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "'Playfair Display', serif", borderBottom: `1px solid ${PALETTE.sepia200}` }}>
        Reject Application
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Typography variant="body2" sx={{ mb: 2, color: PALETTE.inkMid }}>
          You are about to reject <strong>{doctorName}'s</strong> doctor application.
          Optionally provide a reason that will be sent to the applicant.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Rejection reason (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Missing required certifications…"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleConfirm}>
          Confirm Rejection
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [pending,  setPending]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection dialog state
  const [rejectTarget, setRejectTarget] = useState(null); // { id, name }

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      adminService.getStats(),
      adminService.getPendingDoctors({ limit: 5 }),
    ])
      .then(([statsRes, pendingRes]) => {
        setStats(statsRes.data.data.stats);
        setPending(pendingRes.data.data.doctors);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id, name) => {
    setActionLoading(true);
    setSuccessMsg(""); setErrorMsg("");
    try {
      await adminService.approveDoctor(id);
      setSuccessMsg(`Dr. ${name}'s application has been approved successfully.`);
      fetchData();
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (note) => {
    if (!rejectTarget) return;
    const { id, name } = rejectTarget;
    setRejectTarget(null);
    setActionLoading(true);
    setSuccessMsg(""); setErrorMsg("");
    try {
      await adminService.rejectDoctor(id, { adminNote: note || undefined });
      setSuccessMsg(`${name}'s application has been declined.`);
      fetchData();
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const byStatus = stats?.appointmentsByStatus || {};

  return (
    <Box sx={{ maxWidth: 1150, mx: "auto", py: 2 }}>

      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Administration — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          Platform Overview
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Real-time metrics, pending actions, and system health.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.burgundy700, borderRadius: 2 }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 3 }}>
        <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
        <Typography sx={{ color: PALETTE.sepia200, fontSize: "1.2rem" }}>✦</Typography>
        <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg("")}>{errorMsg}</Alert>
      )}

      {/* ── Stat cards ───────────────────────────────────────── */}
      <Typography variant="overline" sx={{ display: "block", mb: 2, letterSpacing: "0.18em", color: PALETTE.inkLight }}>
        — Platform Statistics
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleOutlineIcon />}  label="Total Patients"    value={stats?.totalUsers}       accent={PALETTE.teal700}    loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<LocalHospitalIcon />}  label="Active Doctors"    value={stats?.totalDoctors}     accent={PALETTE.success}    loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIndIcon />}
            label="Pending Reviews"
            value={stats?.pendingDoctors}
            accent={PALETTE.warning}
            sub={stats?.pendingDoctors > 0 ? "Require your attention" : undefined}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CalendarMonthIcon />}  label="Total Appointments" value={stats?.totalAppointments} accent={PALETTE.burgundy700} loading={loading} />
        </Grid>
      </Grid>

      {/* ── Appointment breakdown ─────────────────────────────── */}
      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}`, borderRadius: 2, overflow: "hidden", mb: 4 }}>
        <Box sx={{ px: 3, py: 2, background: PALETTE.sepia100, display: "flex", alignItems: "center", gap: 1.5 }}>
          <BarChartIcon sx={{ color: PALETTE.inkMid, fontSize: 18 }} />
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem" }}>
            Appointment Breakdown
          </Typography>
        </Box>
        <Box sx={{ p: 3, display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[
            { key: "pending",   color: PALETTE.warning,    label: "Pending"   },
            { key: "approved",  color: PALETTE.teal700,    label: "Approved"  },
            { key: "completed", color: PALETTE.success,    label: "Completed" },
            { key: "cancelled", color: PALETTE.inkLight,   label: "Cancelled" },
            { key: "rejected",  color: PALETTE.error,      label: "Rejected"  },
          ].map(({ key, color, label }) => (
            <Box key={key} sx={{ textAlign: "center", minWidth: 80 }}>
              <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color, fontWeight: 700, lineHeight: 1 }}>
                {byStatus[key] ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: "capitalize", color: PALETTE.inkLight }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── Pending doctor applications ───────────────────────── */}
      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}`, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, background: PALETTE.inkDark, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AssignmentIndIcon sx={{ color: PALETTE.sepia200, fontSize: 20 }} />
            <Typography sx={{ fontFamily: "'Playfair Display', serif", color: "#FFF", fontWeight: 700, fontSize: "1rem" }}>
              Pending Doctor Applications
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => navigate("/admin/doctors")}
            sx={{ color: PALETTE.sepia200, fontSize: "0.78rem", "&:hover": { background: "rgba(255,255,255,0.08)" } }}
          >
            View All →
          </Button>
        </Box>

        {loading ? (
          <SectionLoader />
        ) : pending.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: PALETTE.sepia200, mb: 1 }} />
            <Typography variant="body1" sx={{ color: PALETTE.inkLight }}>
              No pending applications. The review queue is clear.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Exp.</TableCell>
                <TableCell>Fee</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.map((doc) => (
                <TableRow key={doc._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>
                      {doc.userId?.name}
                    </Typography>
                    <Typography variant="caption">{doc.userId?.email}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{doc.specialization}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{doc.location}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{doc.experience} yrs</Typography></TableCell>
                  <TableCell><Typography variant="body2">${doc.fees}</Typography></TableCell>
                  <TableCell align="right">
                    <Button
                      size="small" variant="contained" disabled={actionLoading}
                      onClick={() => handleApprove(doc._id, doc.userId?.name)}
                      sx={{ mr: 1, fontSize: "0.75rem", py: 0.5 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small" variant="outlined" color="error" disabled={actionLoading}
                      onClick={() => setRejectTarget({ id: doc._id, name: doc.userId?.name })}
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

      {/* ── Rejection Dialog (replaces window.prompt) ─────────── */}
      <RejectionDialog
        open={!!rejectTarget}
        doctorName={rejectTarget?.name}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />
    </Box>
  );
}
