// =============================================================
//  pages/admin/AdminAppointmentsPage.jsx
// =============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Avatar, Alert, TextField,
  InputAdornment, Tabs, Tab, Pagination, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon        from "@mui/icons-material/Search";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import { adminService, appointmentService }  from "../../api/services";
import StatusChip        from "../../components/common/StatusChip";
import { SectionLoader } from "../../components/common/Loaders";
import { PALETTE }       from "../../theme";
import dayjs             from "dayjs";

const TABS  = ["all", "pending", "approved", "completed", "cancelled", "rejected"];
const LIMIT = 15;

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

export default function AdminAppointmentsPage() {
  const [tabIndex,      setTabIndex]      = useState(0);
  const [search,        setSearch]        = useState("");
  const [page,          setPage]          = useState(1);
  const [appointments,  setAppointments]  = useState([]);
  const [total,         setTotal]         = useState(0);
  const [pages,         setPages]         = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [successMsg,    setSuccessMsg]    = useState("");

  // Cancel dialog (dispute resolution)
  const [cancelDialog,  setCancelDialog]  = useState({ open: false, id: null });
  const [adminNote,     setAdminNote]     = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const activeStatus = TABS[tabIndex] === "all" ? undefined : TABS[tabIndex];

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT, ...(activeStatus && { status: activeStatus }) };
      const res = await adminService.getAppointments(params);
      const { data: { appointments: appts }, total: t, pages: p } = res.data;
      setAppointments(appts || []);
      setTotal(t || 0);
      setPages(p || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus]);

  useEffect(() => { setPage(1); }, [activeStatus]);
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Client-side search on loaded data
  const filtered = search
    ? appointments.filter((a) => {
        const q = search.toLowerCase();
        return (
          a.patientId?.name?.toLowerCase().includes(q) ||
          a.patientId?.email?.toLowerCase().includes(q) ||
          a.doctorId?.userId?.name?.toLowerCase().includes(q)
        );
      })
    : appointments;

  const handleCancelConfirm = async () => {
    if (!adminNote.trim()) {
      setError("Please specify a cancellation reason for dispute logs.");
      return;
    }
    setCancelLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await appointmentService.cancel(cancelDialog.id, { adminNote });
      setSuccessMsg("Appointment cancelled successfully. Patient and doctor have been notified.");
      setCancelDialog({ open: false, id: null });
      setAdminNote("");
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 2 }}>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Administration — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          Appointment Ledger
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Full audit trail and dispute resolution management.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.burgundy700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <TextField
        fullWidth placeholder="Search patient or doctor name…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: PALETTE.inkLight }} />
            </InputAdornment>
          ),
        }}
      />

      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}` }}>
        <Tabs
          value={tabIndex} onChange={(_, v) => setTabIndex(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${PALETTE.sepia200}`, "& .MuiTabs-indicator": { backgroundColor: PALETTE.teal700, height: 3 } }}
        >
          {TABS.map((t) => (
            <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)}
              sx={{ textTransform: "none", fontFamily: "'Lato', sans-serif", fontWeight: 600 }} />
          ))}
        </Tabs>

        {loading ? <SectionLoader /> : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CalendarMonthIcon sx={{ fontSize: 52, color: PALETTE.sepia200, mb: 1.5 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>No appointments found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Document</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((appt) => {
                const patient = appt.patientId || {};
                const doc     = appt.doctorId   || {};
                const docUser = doc.userId       || {};
                const canCancel = ["pending", "approved"].includes(appt.status);

                return (
                  <TableRow key={appt._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: PALETTE.burgundy700, fontSize: "0.78rem", fontWeight: 700 }}>
                          {patient.name?.[0] || "P"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>
                            {patient.name || "—"}
                          </Typography>
                          <Typography variant="caption">{patient.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: PALETTE.teal700, fontSize: "0.78rem", fontWeight: 700 }}>
                          {docUser.name?.[0] || "D"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>
                            Dr. {docUser.name || "—"}
                          </Typography>
                          <Typography variant="caption">{docUser.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{doc.specialization || "—"}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                        {dayjs(appt.date).format("DD MMM YYYY")}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{appt.timeSlot}</Typography></TableCell>
                    <TableCell><StatusChip status={appt.status} /></TableCell>
                    <TableCell>
                      {appt.documentUrl ? (
                        <Typography variant="body2" sx={{ color: PALETTE.teal700, cursor: "pointer", textDecoration: "underline" }}
                          component="a" href={`${process.env.REACT_APP_API_URL?.replace("/api/v1","")||"http://localhost:5000"}/${appt.documentUrl}`}
                          target="_blank" rel="noopener noreferrer">
                          View
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {canCancel ? (
                        <Button
                          size="small" variant="outlined" color="error"
                          startIcon={<CancelOutlinedIcon fontSize="small" />}
                          onClick={() => setCancelDialog({ open: true, id: appt._id })}
                          sx={{ fontSize: "0.72rem", py: 0.25 }}
                        >
                          Dispute Cancel
                        </Button>
                      ) : (
                        <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {pages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
          </Box>
        )}
      </Paper>

      {/* Admin Dispute Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Admin Dispute Cancellation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2.5, color: PALETTE.inkMid }}>
            You are cancelling this appointment on behalf of the platform. Please enter a detailed reason for the cancel log. This note will be visible to both the patient and doctor.
          </Typography>
          <TextField
            fullWidth multiline rows={3}
            label="Dispute / Cancellation Reason"
            placeholder="Specify reason for cancelling this booking..."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setCancelDialog({ open: false, id: null }); setAdminNote(""); }}>Cancel</Button>
          <Button
            variant="contained" color="error"
            onClick={handleCancelConfirm}
            disabled={cancelLoading}
            startIcon={cancelLoading ? <CircularProgress size={14} color="inherit" /> : <CancelOutlinedIcon />}
          >
            Confirm Dispute Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
