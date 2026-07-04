// =============================================================
//  pages/doctor/DoctorAppointmentsPage.jsx
//
//  Full appointment management for doctors:
//    • Tabs: Pending / Approved / Completed / Rejected
//    • Approve (pending → approved)
//    • Reject with note (pending → rejected)
//    • Complete with Visit Summary & Recommendations (approved → completed)
//    • View patient medical history & clinical records
//    • View attached patient document
// =============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableHead,
  TableRow, TableCell, TableBody, Avatar, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Divider, CircularProgress, IconButton, Tooltip,
  Grid, List, ListItem, ListItemText,
} from "@mui/material";
import CalendarMonthIcon       from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon  from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon      from "@mui/icons-material/CancelOutlined";
import TaskAltIcon             from "@mui/icons-material/TaskAlt";
import VisibilityOutlinedIcon  from "@mui/icons-material/VisibilityOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import PersonSearchIcon        from "@mui/icons-material/PersonSearch";

import { appointmentService } from "../../api/services";
import { doctorService }      from "../../api/services";
import StatusChip             from "../../components/common/StatusChip";
import { SectionLoader }      from "../../components/common/Loaders";
import { PALETTE }            from "../../theme";
import dayjs                  from "dayjs";

const TABS = ["pending", "approved", "completed", "rejected"];
const API_BASE = process.env.REACT_APP_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

// Calculate age from dateOfBirth
function calculateAge(dobString) {
  if (!dobString) return "";
  const birthDate = new Date(dobString);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
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

export default function DoctorAppointmentsPage() {
  const [tabIndex,      setTabIndex]      = useState(0);
  const [appointments,  setAppointments]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [successMsg,    setSuccessMsg]    = useState("");
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Action dialogs
  const [rejectDialog,  setRejectDialog]  = useState({ open: false, id: null });
  const [doctorNote,    setDoctorNote]    = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Complete Dialog
  const [completeDialog, setCompleteDialog] = useState({ open: false, id: null });
  const [visitSummary,   setVisitSummary]   = useState("");
  const [recommendations, setRecommendations] = useState("");

  // Notes viewer dialog
  const [notesDialog,   setNotesDialog]   = useState({
    open: false,
    notes: "",
    doctorNote: "",
    visitSummary: "",
    recommendations: "",
  });

  // Patient Clinical Record viewer dialog
  const [recordDialog, setRecordDialog] = useState({ open: false, patient: null });

  const activeStatus = TABS[tabIndex];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [apptRes, docRes] = await Promise.all([
        appointmentService.getDoctorList({ status: activeStatus, limit: 50 }),
        doctorService.getMyProfile(),
      ]);
      setAppointments(apptRes.data.data.appointments);
      setDoctorProfile(docRes.data.data.doctor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Approve ────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await appointmentService.approve(id);
      setSuccessMsg("Appointment approved. The patient has been notified.");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ─────────────────────────────────────────────────
  const handleRejectConfirm = async () => {
    setActionLoading(true);
    try {
      await appointmentService.reject(rejectDialog.id, { doctorNote });
      setSuccessMsg("Appointment declined. The patient has been notified.");
      setRejectDialog({ open: false, id: null });
      setDoctorNote("");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Complete ───────────────────────────────────────────────
  const handleCompleteConfirm = async () => {
    setActionLoading(true);
    try {
      await appointmentService.complete(completeDialog.id, { visitSummary, recommendations });
      setSuccessMsg("Appointment marked as completed and clinical summary recorded.");
      setCompleteDialog({ open: false, id: null });
      setVisitSummary("");
      setRecommendations("");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const statusLabel = activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 2 }}>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Doctor Portal — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          Appointments
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Review, approve, and manage your patient appointments.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.teal700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
      )}

      <Paper elevation={0} sx={{ border: `1px solid ${PALETTE.sepia200}` }}>
        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{
            borderBottom: `1px solid ${PALETTE.sepia200}`,
            "& .MuiTabs-indicator": { backgroundColor: PALETTE.teal700, height: 3 },
          }}
        >
          {TABS.map((t) => (
            <Tab
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              sx={{ textTransform: "none", fontFamily: "'Lato', sans-serif", fontWeight: 600 }}
            />
          ))}
        </Tabs>

        {loading ? (
          <SectionLoader />
        ) : appointments.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CalendarMonthIcon sx={{ fontSize: 52, color: PALETTE.sepia200, mb: 1.5 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>No {statusLabel} Appointments</Typography>
            <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>
              {activeStatus === "pending"
                ? "You have no pending requests right now."
                : `No ${statusLabel.toLowerCase()} appointments to display.`}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Documents & Clinicals</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt) => {
                const patient = appt.patientId || {};
                return (
                  <TableRow key={appt._id} hover>
                    {/* Patient */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: PALETTE.burgundy700, fontSize: "0.85rem", fontWeight: 700 }}>
                          {patient.name?.[0] || "P"}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: PALETTE.teal700,
                              cursor: "pointer",
                              textDecoration: "underline",
                              "&:hover": { color: PALETTE.teal900 }
                            }}
                            onClick={() => setRecordDialog({ open: true, patient })}
                          >
                            {patient.name || "—"}
                          </Typography>
                          <Typography variant="caption">{patient.phone || patient.email || ""}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                        {dayjs(appt.date).format("DD MMM YYYY")}
                      </Typography>
                      <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>
                        {dayjs(appt.date).format("dddd")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{appt.timeSlot}</Typography>
                    </TableCell>

                    <TableCell><StatusChip status={appt.status} /></TableCell>

                    {/* Documents & Notes */}
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                        {appt.documentUrl && (
                          <Tooltip title="View medical document">
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
                        )}
                        <Tooltip title="View Patient Clinical Records">
                          <IconButton
                            size="small"
                            onClick={() => setRecordDialog({ open: true, patient })}
                            sx={{ color: PALETTE.burgundy700 }}
                          >
                            <PersonSearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(appt.notes || appt.doctorNote || appt.visitSummary || appt.recommendations) && (
                          <Tooltip title="View notes & visit summary">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setNotesDialog({
                                  open: true,
                                  notes: appt.notes || "",
                                  doctorNote: appt.doctorNote || "",
                                  visitSummary: appt.visitSummary || "",
                                  recommendations: appt.recommendations || "",
                                })
                              }
                              sx={{ color: PALETTE.inkLight }}
                            >
                              <StickyNote2OutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        {appt.status === "pending" && (
                          <>
                            <Button
                              size="small" variant="contained" disabled={actionLoading}
                              startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                              onClick={() => handleApprove(appt._id)}
                              sx={{ fontSize: "0.75rem", py: 0.5 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small" variant="outlined" color="error" disabled={actionLoading}
                              startIcon={<CancelOutlinedIcon fontSize="small" />}
                              onClick={() => setRejectDialog({ open: true, id: appt._id })}
                              sx={{ fontSize: "0.75rem", py: 0.5 }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {appt.status === "approved" && (
                          <Button
                            size="small" variant="outlined" disabled={actionLoading}
                            startIcon={<TaskAltIcon fontSize="small" />}
                            onClick={() => setCompleteDialog({ open: true, id: appt._id })}
                            sx={{ fontSize: "0.75rem", py: 0.5, borderColor: PALETTE.success, color: PALETTE.success }}
                          >
                            Complete
                          </Button>
                        )}
                        {["completed", "rejected", "cancelled"].includes(appt.status) && (
                          <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>—</Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Decline Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: PALETTE.inkMid }}>
            Provide a reason to help the patient understand and rebook at a better time.
          </Typography>
          <TextField
            fullWidth multiline rows={3}
            label="Reason for declining (optional)"
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button>
          <Button
            variant="contained" color="error"
            onClick={handleRejectConfirm}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialog.open} onClose={() => setCompleteDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Complete Consultation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2.5, color: PALETTE.inkMid }}>
            Complete the appointment and securely submit clinical recommendations and summaries for the patient's record.
          </Typography>
          <TextField
            fullWidth multiline rows={4}
            label="Visit Summary"
            placeholder="Document chief complaints, symptoms, diagnosis details, and clinical findings..."
            value={visitSummary}
            onChange={(e) => setVisitSummary(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth multiline rows={3}
            label="Clinical Recommendations & Prescriptions"
            placeholder="Enter prescriptions, dosage schedules, tests required, and follow-up guidelines..."
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCompleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCompleteConfirm}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <TaskAltIcon />}
          >
            Submit & Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Record Dialog */}
      <Dialog open={recordDialog.open} onClose={() => setRecordDialog({ open: false, patient: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Patient Medical History</DialogTitle>
        <DialogContent>
          {recordDialog.patient ? (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 46, height: 46, bgcolor: PALETTE.burgundy700, fontSize: "1.2rem", fontWeight: 700 }}>
                  {recordDialog.patient.name?.[0] || "P"}
                </Avatar>
                <Box>
                  <Typography variant="h6">{recordDialog.patient.name}</Typography>
                  <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>
                    Email: {recordDialog.patient.email} | Phone: {recordDialog.patient.phone || "—"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: PALETTE.inkLight, display: "block" }}>Date of Birth</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {recordDialog.patient.dateOfBirth
                      ? `${dayjs(recordDialog.patient.dateOfBirth).format("DD MMM YYYY")} (${calculateAge(recordDialog.patient.dateOfBirth)} years old)`
                      : "Not specified"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: PALETTE.inkLight, display: "block" }}>Gender</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {recordDialog.patient.gender || "Not specified"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: PALETTE.inkLight, display: "block" }}>Blood Group</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.burgundy700 }}>
                    {recordDialog.patient.bloodGroup || "Not specified"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: PALETTE.inkLight, display: "block" }}>Allergies</Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, borderColor: PALETTE.sepia200, bgcolor: "rgba(0,0,0,0.01)" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {recordDialog.patient.allergies || "No allergies documented."}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: PALETTE.inkLight, display: "block" }}>Chronic Conditions & Medical History</Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, borderColor: PALETTE.sepia200, bgcolor: "rgba(0,0,0,0.01)" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {recordDialog.patient.medicalHistory || "No previous history documented."}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <SectionLoader />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRecordDialog({ open: false, patient: null })}>Close History</Button>
        </DialogActions>
      </Dialog>

      {/* Notes viewer dialog */}
      <Dialog open={notesDialog.open} onClose={() => setNotesDialog({ open: false, notes: "", doctorNote: "", visitSummary: "", recommendations: "" })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>Consultation Details</DialogTitle>
        <DialogContent>
          {notesDialog.notes && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" sx={{ color: PALETTE.inkLight, display: "block", mb: 0.5 }}>
                Patient Booking Notes
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkMid, whiteSpace: "pre-wrap" }}>
                {notesDialog.notes}
              </Typography>
            </Box>
          )}

          {notesDialog.doctorNote && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" sx={{ color: PALETTE.inkLight, display: "block", mb: 0.5 }}>
                Decline / Special Notes
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkMid, whiteSpace: "pre-wrap" }}>
                {notesDialog.doctorNote}
              </Typography>
            </Box>
          )}

          {notesDialog.visitSummary && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" sx={{ color: PALETTE.teal700, display: "block", mb: 0.5 }}>
                Visit Summary
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkDark, whiteSpace: "pre-wrap", fontWeight: 500 }}>
                {notesDialog.visitSummary}
              </Typography>
            </Box>
          )}

          {notesDialog.recommendations && (
            <Box>
              <Typography variant="overline" sx={{ color: PALETTE.burgundy700, display: "block", mb: 0.5 }}>
                Recommendations & Prescriptions
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.inkDark, whiteSpace: "pre-wrap", fontWeight: 500 }}>
                {notesDialog.recommendations}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNotesDialog({ open: false, notes: "", doctorNote: "", visitSummary: "", recommendations: "" })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
