// =============================================================
//  pages/admin/AdminDoctorsPage.jsx
// =============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Avatar, Button, Alert, Chip,
  Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress,
} from "@mui/material";
import LocalHospitalIcon      from "@mui/icons-material/LocalHospital";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon     from "@mui/icons-material/CancelOutlined";

import { adminService }  from "../../api/services";
import StatusChip        from "../../components/common/StatusChip";
import { SectionLoader } from "../../components/common/Loaders";
import { PALETTE }       from "../../theme";
import dayjs             from "dayjs";

const TABS = ["pending", "approved", "rejected"];

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

export default function AdminDoctorsPage() {
  const [tabIndex,   setTabIndex]   = useState(0);
  const [doctors,    setDoctors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [approveDialog, setApproveDialog] = useState({ open: false, doc: null });
  const [rejectDialog,  setRejectDialog]  = useState({ open: false, doc: null });
  const [adminNote,     setAdminNote]     = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const activeStatus = TABS[tabIndex];

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = activeStatus === "pending"
        ? await adminService.getPendingDoctors({ limit: 50 })
        : await adminService.getAllDoctors({ status: activeStatus, limit: 50 });
      setDoctors(res.data.data.doctors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleApproveConfirm = async () => {
    setActionLoading(true);
    try {
      await adminService.approveDoctor(approveDialog.doc._id, { adminNote });
      setSuccessMsg(`Dr. ${approveDialog.doc.userId?.name}'s application approved.`);
      setApproveDialog({ open: false, doc: null });
      setAdminNote("");
      fetchDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    setActionLoading(true);
    try {
      await adminService.rejectDoctor(rejectDialog.doc._id, { adminNote });
      setSuccessMsg(`${rejectDialog.doc.userId?.name}'s application declined.`);
      setRejectDialog({ open: false, doc: null });
      setAdminNote("");
      fetchDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 2 }}>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Administration — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          Doctor Applications
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Review and manage physician applications to the platform.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.burgundy700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
      {error      && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}` }}>
        <Tabs
          value={tabIndex} onChange={(_, v) => setTabIndex(v)}
          sx={{ borderBottom: `1px solid ${PALETTE.sepia200}`, "& .MuiTabs-indicator": { backgroundColor: PALETTE.teal700, height: 3 } }}
        >
          {TABS.map((t) => (
            <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)}
              sx={{ textTransform: "none", fontFamily: "'Lato', sans-serif", fontWeight: 600 }} />
          ))}
        </Tabs>

        {loading ? <SectionLoader /> : doctors.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <LocalHospitalIcon sx={{ fontSize: 52, color: PALETTE.sepia200, mb: 1.5 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>
              No {activeStatus} applications
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Fee</TableCell>
                <TableCell>Applied</TableCell>
                <TableCell>Status</TableCell>
                {activeStatus === "pending" && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doc) => (
                <TableRow key={doc._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: PALETTE.teal700, fontSize: "0.85rem", fontWeight: 700 }}>
                        {doc.userId?.name?.[0] || "D"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>{doc.userId?.name}</Typography>
                        <Typography variant="caption">{doc.userId?.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2">{doc.specialization}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{doc.location}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{doc.experience} yrs</Typography></TableCell>
                  <TableCell><Typography variant="body2">${doc.fees}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2">{dayjs(doc.createdAt).format("DD MMM YYYY")}</Typography>
                  </TableCell>
                  <TableCell><StatusChip status={doc.status} /></TableCell>
                  {activeStatus === "pending" && (
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          size="small" variant="contained" disabled={actionLoading}
                          startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                          onClick={() => { setAdminNote(""); setApproveDialog({ open: true, doc }); }}
                          sx={{ fontSize: "0.75rem", py: 0.5 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small" variant="outlined" color="error" disabled={actionLoading}
                          startIcon={<CancelOutlinedIcon fontSize="small" />}
                          onClick={() => { setAdminNote(""); setRejectDialog({ open: true, doc }); }}
                          sx={{ fontSize: "0.75rem", py: 0.5 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Approve dialog */}
      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, doc: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>
          Approve Dr. {approveDialog.doc?.userId?.name}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: PALETTE.inkMid }}>
            The applicant's account will be elevated to Doctor status and they'll receive a notification.
          </Typography>
          <TextField fullWidth label="Optional note to applicant" value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)} multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApproveDialog({ open: false, doc: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleApproveConfirm} disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : null}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, doc: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>
          Decline {rejectDialog.doc?.userId?.name}'s Application?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: PALETTE.inkMid }}>
            Please provide a reason — this will be sent to the applicant.
          </Typography>
          <TextField fullWidth label="Reason for rejection" value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)} multiline rows={3}
            placeholder="e.g. Incomplete credentials, missing documentation…" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog({ open: false, doc: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm} disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : null}>
            Decline Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
