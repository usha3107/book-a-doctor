// =============================================================
//  pages/patient/AppointmentsPage.jsx
//
//  Features:
//    • Tabbed view: All / Pending / Approved / Completed / Cancelled / Rejected
//    • Cancel a pending appointment inline
//    • Upload medical document to an existing appointment
//    • View Doctor's clinical recommendations & visit summaries
//    • Paginated, sorted newest-first
// =============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Avatar, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Chip, Tooltip, IconButton, CircularProgress,
} from "@mui/material";
import CalendarMonthIcon   from "@mui/icons-material/CalendarMonth";
import UploadFileIcon      from "@mui/icons-material/UploadFile";
import CancelOutlinedIcon  from "@mui/icons-material/CancelOutlined";
import AttachFileIcon      from "@mui/icons-material/AttachFile";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";

import { appointmentService } from "../../api/services";
import StatusChip             from "../../components/common/StatusChip";
import { SectionLoader }      from "../../components/common/Loaders";
import { PALETTE }            from "../../theme";
import dayjs                  from "dayjs";

const TABS = ["all", "pending", "approved", "completed", "cancelled", "rejected"];
const API_BASE = process.env.REACT_APP_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

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

export default function AppointmentsPage() {
  const [tabIndex,     setTabIndex]     = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");

  // Cancel confirmation dialog
  const [cancelDialog, setCancelDialog] = useState({ open: false, id: null });
  const [cancelLoading, setCancelLoading] = useState(false);

  // Upload document dialog
  const [uploadDialog, setUploadDialog] = useState({ open: false, id: null });
  const [uploadFile,   setUploadFile]   = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError,  setUploadError]  = useState("");

  // Consultation Details Dialog
  const [notesDialog, setNotesDialog] = useState({
    open: false,
    notes: "",
    doctorNote: "",
    visitSummary: "",
    recommendations: "",
    docName: "",
  });

  const activeStatus = TABS[tabIndex] === "all" ? undefined : TABS[tabIndex];

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 50, ...(activeStatus && { status: activeStatus }) };
      const res = await appointmentService.getMyList(params);
      setAppointments(res.data.data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── Cancel ──────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    try {
      await appointmentService.cancel(cancelDialog.id);
      setSuccessMsg("Appointment cancelled successfully.");
      setCancelDialog({ open: false, id: null });
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Upload document ──────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF, JPEG, or PNG files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be under 5 MB.");
      return;
    }
    setUploadError("");
    setUploadFile(file);
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile) return;
    setUploadLoading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("document", uploadFile);
      await appointmentService.uploadDocument(uploadDialog.id, fd);
      setSuccessMsg("Document uploaded successfully.");
      setUploadDialog({ open: false, id: null });
      setUploadFile(null);
      fetchAppointments();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 2 }}>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Patient Portal — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          My Appointments
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Track, manage, and review all your medical appointments.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.burgundy700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}` }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid ${PALETTE.sepia200}`,
            "& .MuiTabs-indicator": { backgroundColor: PALETTE.teal700, height: 3 },
          }}
        >
          {TABS.map((t) => (
            <Tab
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              sx={{ textTransform: "none", fontFamily: "'Lato', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
            />
          ))}
        </Tabs>

        {loading ? (
          <SectionLoader />
        ) : appointments.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CalendarMonthIcon sx={{ fontSize: 52, color: PALETTE.sepia200, mb: 1.5 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>No appointments here</Typography>
            <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>
              {tabIndex === 0
                ? "You haven't booked any appointments yet."
                : `No ${TABS[tabIndex]} appointments found.`}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Documents & Clinicals</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt) => {
                const doc = appt.doctorId;
                const docName = doc?.userId?.name || "—";
                const isPending  = appt.status === "pending";
                const isActive   = ["pending", "approved"].includes(appt.status);

                return (
                  <TableRow key={appt._id} hover>
                    {/* Doctor */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{ width: 34, height: 34, bgcolor: PALETTE.teal700, fontSize: "0.85rem", fontWeight: 700 }}
                        >
                          {docName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>
                            Dr. {docName}
                          </Typography>
                          <Typography variant="caption">{doc?.userId?.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{doc?.specialization || "—"}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                        {dayjs(appt.date).format("DD MMM YYYY")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                        {appt.timeSlot}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <StatusChip status={appt.status} />
                        {appt.doctorNote && (
                          <Tooltip title={appt.doctorNote}>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block", mt: 0.5, color: PALETTE.inkLight,
                                cursor: "help", maxWidth: 120,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}
                            >
                              Note: {appt.doctorNote}
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Document & Clinicals */}
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                        {appt.documentUrl ? (
                          <Tooltip title="View attached document">
                            <IconButton
                              size="small"
                              component="a"
                              href={`${API_BASE}/${appt.documentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: PALETTE.teal700 }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : isActive ? (
                          <Tooltip title="Attach a medical document">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setUploadFile(null);
                                setUploadError("");
                                setUploadDialog({ open: true, id: appt._id });
                              }}
                              sx={{ color: PALETTE.inkLight }}
                            >
                              <UploadFileIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {(appt.notes || appt.doctorNote || appt.visitSummary || appt.recommendations) && (
                          <Tooltip title="View notes & clinical details">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setNotesDialog({
                                  open: true,
                                  notes: appt.notes || "",
                                  doctorNote: appt.doctorNote || "",
                                  visitSummary: appt.visitSummary || "",
                                  recommendations: appt.recommendations || "",
                                  docName,
                                })
                              }
                              sx={{ color: PALETTE.inkLight }}
                            >
                              <StickyNote2OutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!appt.documentUrl && !isActive && !(appt.notes || appt.doctorNote || appt.visitSummary || appt.recommendations) && (
                          <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>—</Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      {isPending ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelOutlinedIcon fontSize="small" />}
                          onClick={() => setCancelDialog({ open: true, id: appt._id })}
                          sx={{ fontSize: "0.75rem", py: 0.5 }}
                        >
                          Cancel
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
      </Paper>

      {/* ── Support Callout ──────────────────────────────────── */}
      <Typography variant="body2" sx={{ mt: 2, color: PALETTE.inkLight, textAlign: "center" }}>
        Need to reschedule, report a dispute, or contact support? Email <strong>support@medconsult.com</strong> or call <strong>+1 (800) 555-0199</strong>.
      </Typography>

      {/* ── Cancel confirmation dialog ───────────────────────── */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Cancel Appointment?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: PALETTE.inkMid }}>
            This action cannot be undone. The appointment will be marked as cancelled
            and the doctor will be notified.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialog({ open: false, id: null })}>Keep</Button>
          <Button
            variant="contained" color="error"
            onClick={handleCancelConfirm}
            disabled={cancelLoading}
            startIcon={cancelLoading ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Upload document dialog ───────────────────────────── */}
      <Dialog
        open={uploadDialog.open}
        onClose={() => setUploadDialog({ open: false, id: null })}
        maxWidth="sm" fullWidth
      >
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>
          Attach Medical Document
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: PALETTE.inkMid, mb: 2 }}>
            Upload a PDF, JPEG, or PNG — lab results, prescriptions, referral letters. Max 5 MB.
          </Typography>
          {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
          <Box
            component="label"
            htmlFor="upload-doc-appts"
            sx={{
              display: "flex", alignItems: "center", gap: 2, p: 2.5,
              border: `2px dashed ${uploadFile ? PALETTE.teal700 : PALETTE.sepia200}`,
              borderRadius: 2,
              background: uploadFile ? PALETTE.teal50 : PALETTE.cream,
              cursor: "pointer", transition: "all 0.15s",
              "&:hover": { borderColor: PALETTE.teal700, background: PALETTE.teal50 },
            }}
          >
            <input
              id="upload-doc-appts"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              hidden
              onChange={handleFileChange}
            />
            {uploadFile
              ? <AttachFileIcon sx={{ color: PALETTE.teal700 }} />
              : <UploadFileIcon sx={{ color: PALETTE.inkLight }} />}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: uploadFile ? PALETTE.teal900 : PALETTE.inkMid }}>
                {uploadFile ? uploadFile.name : "Click to select a file"}
              </Typography>
              {uploadFile && (
                <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>
                  {(uploadFile.size / 1024).toFixed(1)} KB
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setUploadDialog({ open: false, id: null }); setUploadFile(null); }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadConfirm}
            disabled={!uploadFile || uploadLoading}
            startIcon={uploadLoading ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Consultation Details Dialog ─────────────────────── */}
      <Dialog
        open={notesDialog.open}
        onClose={() => setNotesDialog({ open: false, notes: "", doctorNote: "", visitSummary: "", recommendations: "", docName: "" })}
        maxWidth="sm" fullWidth
      >
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Consultation Details</DialogTitle>
        <DialogContent>
          {notesDialog.notes && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" sx={{ color: PALETTE.inkLight, display: "block", mb: 0.5 }}>
                Your Booking Notes
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkMid, whiteSpace: "pre-wrap" }}>
                {notesDialog.notes}
              </Typography>
            </Box>
          )}

          {notesDialog.doctorNote && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" sx={{ color: PALETTE.inkLight, display: "block", mb: 0.5 }}>
                Doctor's Response Note
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkMid, whiteSpace: "pre-wrap" }}>
                {notesDialog.doctorNote}
              </Typography>
            </Box>
          )}

          {notesDialog.visitSummary && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" sx={{ color: PALETTE.teal700, display: "block", mb: 0.5 }}>
                Visit Summary (Dr. {notesDialog.docName})
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkDark, whiteSpace: "pre-wrap", fontWeight: 500 }}>
                {notesDialog.visitSummary}
              </Typography>
            </Box>
          )}

          {notesDialog.recommendations && (
            <Box>
              <Typography variant="overline" sx={{ color: PALETTE.burgundy700, display: "block", mb: 0.5 }}>
                Clinical Recommendations & Prescriptions
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkDark, whiteSpace: "pre-wrap", fontWeight: 500 }}>
                {notesDialog.recommendations}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNotesDialog({ open: false, notes: "", doctorNote: "", visitSummary: "", recommendations: "", docName: "" })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
