// =============================================================
//  components/common/BookingModal.jsx
//
//  Self-contained booking flow rendered as a Dialog.
//  Props:
//    open        {boolean}
//    onClose     {() => void}
//    doctor      {Doctor document (populated with userId)}
//    onBooked    {() => void}  — called after successful booking
//
//  Internal steps:
//    1. User picks a day from the doctor's available schedule
//    2. User picks a time slot for that day
//    3. User picks a calendar date that matches the chosen day
//    4. Optional: notes + medical document upload
//    5. Confirm → POST /api/v1/appointments
// =============================================================

import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Stepper, Step, StepLabel,
  Grid, Chip, TextField, Divider, Alert, IconButton,
  CircularProgress, Paper,
} from "@mui/material";
import CloseIcon           from "@mui/icons-material/Close";
import CalendarMonthIcon   from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon      from "@mui/icons-material/AccessTime";
import UploadFileIcon      from "@mui/icons-material/UploadFile";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import AttachFileIcon      from "@mui/icons-material/AttachFile";

import { appointmentService } from "../../api/services";
import { PALETTE }            from "../../theme";

// ── Helpers ───────────────────────────────────────────────────
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/** Returns the next N dates (from today) whose weekday name matches `dayName`. */
function getUpcomingDates(dayName, count = 4) {
  const targetIndex = DAY_NAMES.indexOf(dayName);
  const results = [];
  let cursor = dayjs().startOf("day");
  // Start from tomorrow — no same-day bookings
  cursor = cursor.add(1, "day");
  while (results.length < count) {
    if (cursor.day() === targetIndex) results.push(cursor);
    cursor = cursor.add(1, "day");
  }
  return results;
}

const STEPS = ["Choose Day & Slot", "Pick a Date", "Notes & Documents", "Confirm"];

// ── Main component ────────────────────────────────────────────
export default function BookingModal({ open, onClose, doctor, onBooked }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDay,  setSelectedDay]  = useState(null);   // e.g. "Monday"
  const [selectedSlot, setSelectedSlot] = useState(null);   // e.g. "09:00 - 09:30"
  const [selectedDate, setSelectedDate] = useState(null);   // dayjs instance
  const [notes,        setNotes]        = useState("");
  const [docFile,      setDocFile]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);

  // Group timings by day
  const timingsByDay = useMemo(() => {
    const map = {};
    (doctor?.timings || []).forEach((t) => {
      if (!map[t.day]) map[t.day] = [];
      map[t.day].push(`${t.startTime} - ${t.endTime}`);
    });
    return map;
  }, [doctor]);

  const availableDays = Object.keys(timingsByDay);

  // Dates that match the selected day (next 4 occurrences)
  const upcomingDates = useMemo(
    () => (selectedDay ? getUpcomingDates(selectedDay, 4) : []),
    [selectedDay]
  );

  const handleReset = () => {
    setActiveStep(0);
    setSelectedDay(null);
    setSelectedSlot(null);
    setSelectedDate(null);
    setNotes("");
    setDocFile(null);
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canNext = () => {
    if (activeStep === 0) return !!selectedDay && !!selectedSlot;
    if (activeStep === 1) return !!selectedDate;
    return true;
  };

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      setError("Only PDF, JPEG, or PNG files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setError("");
    setDocFile(file);
  };

  // ── Submit booking ─────────────────────────────────────────
  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      // Step 1: create the appointment
      const bookRes = await appointmentService.book({
        doctorId: doctor._id,
        date:     selectedDate.toISOString(),
        timeSlot: selectedSlot,
        notes:    notes || undefined,
      });

      const appointmentId = bookRes.data.data.appointment._id;

      // Step 2: upload document if provided
      if (docFile) {
        const fd = new FormData();
        fd.append("document", docFile);
        await appointmentService.uploadDocument(appointmentId, fd);
      }

      setSuccess(true);
      onBooked && onBooked();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const doctorName = doctor?.userId?.name || "Doctor";

  // ── Render ────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: `1px solid ${PALETTE.sepia200}`,
          borderTop: `4px solid ${PALETTE.teal700}`,
        },
      }}
    >
      {/* Title */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5">Book an Appointment</Typography>
            <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>
              with Dr. {doctorName} · {doctor?.specialization}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {success ? (
          /* ── Success state ──────────────────────────────── */
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: PALETTE.success, mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 1 }}>Appointment Requested!</Typography>
            <Typography variant="body1" sx={{ color: PALETTE.inkMid, mb: 1 }}>
              Your appointment with Dr. {doctorName} on{" "}
              <strong>{selectedDate?.format("dddd, DD MMM YYYY")}</strong> at{" "}
              <strong>{selectedSlot}</strong> is pending confirmation.
            </Typography>
            <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>
              You'll receive a notification once the doctor responds.
            </Typography>
          </Box>
        ) : (
          <>
            {/* ── Stepper ─────────────────────────────────── */}
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontFamily: "'Lato', sans-serif",
                        fontSize: "0.75rem",
                        letterSpacing: "0.04em",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* ── Step 0: Day & Slot ───────────────────────── */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="overline" sx={{ display: "block", mb: 1.5 }}>
                  Select a Day
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {availableDays.length === 0 ? (
                    <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>
                      No available days configured.
                    </Typography>
                  ) : (
                    availableDays.map((day) => (
                      <Chip
                        key={day}
                        label={day}
                        clickable
                        onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                        sx={{
                          borderRadius: 2,
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: selectedDay === day ? 700 : 400,
                          background: selectedDay === day ? PALETTE.teal700 : PALETTE.sepia100,
                          color:      selectedDay === day ? "#FFF" : PALETTE.inkMid,
                          border:     `1px solid ${selectedDay === day ? PALETTE.teal700 : PALETTE.sepia200}`,
                          "&:hover": { background: selectedDay === day ? PALETTE.teal800 : PALETTE.sepia200 },
                        }}
                      />
                    ))
                  )}
                </Box>

                {selectedDay && (
                  <>
                    <Typography variant="overline" sx={{ display: "block", mb: 1.5 }}>
                      Available Time Slots — {selectedDay}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(timingsByDay[selectedDay] || []).map((slot) => (
                        <Chip
                          key={slot}
                          icon={<AccessTimeIcon sx={{ fontSize: "14px !important" }} />}
                          label={slot}
                          clickable
                          onClick={() => setSelectedSlot(slot)}
                          sx={{
                            borderRadius: 2,
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: selectedSlot === slot ? 700 : 400,
                            background: selectedSlot === slot ? PALETTE.burgundy700 : PALETTE.cream,
                            color:      selectedSlot === slot ? "#FFF" : PALETTE.inkMid,
                            border:     `1px solid ${selectedSlot === slot ? PALETTE.burgundy700 : PALETTE.sepia200}`,
                            "&:hover": { background: selectedSlot === slot ? PALETTE.burgundy900 : PALETTE.sepia100 },
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* ── Step 1: Pick Date ────────────────────────── */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="overline" sx={{ display: "block", mb: 0.5 }}>
                  Upcoming {selectedDay}s
                </Typography>
                <Typography variant="body2" sx={{ color: PALETTE.inkLight, mb: 2 }}>
                  Select one of the next available dates for {selectedSlot}.
                </Typography>
                <Grid container spacing={1.5}>
                  {upcomingDates.map((date) => {
                    const isSelected = selectedDate?.isSame(date, "day");
                    return (
                      <Grid item xs={6} key={date.toISOString()}>
                        <Paper
                          elevation={0}
                          onClick={() => setSelectedDate(date)}
                          sx={{
                            p: 2, textAlign: "center", cursor: "pointer",
                            border: `2px solid ${isSelected ? PALETTE.teal700 : PALETTE.sepia200}`,
                            background: isSelected ? PALETTE.teal50 : PALETTE.cream,
                            borderRadius: 2,
                            transition: "all 0.15s",
                            "&:hover": { borderColor: PALETTE.teal700, background: PALETTE.teal50 },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: PALETTE.inkLight, letterSpacing: "0.1em", display: "block" }}
                          >
                            {date.format("MMM").toUpperCase()}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ color: isSelected ? PALETTE.teal900 : PALETTE.inkDark, my: 0.25 }}
                          >
                            {date.format("DD")}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: PALETTE.inkLight, letterSpacing: "0.08em", display: "block" }}
                          >
                            {date.format("YYYY")}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {/* ── Step 2: Notes & Documents ────────────────── */}
            {activeStep === 2 && (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes for the doctor (optional)"
                  placeholder="Describe your symptoms or reason for the visit…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mb: 3 }}
                  inputProps={{ maxLength: 1000 }}
                />

                <Typography variant="overline" sx={{ display: "block", mb: 1 }}>
                  Attach a Medical Document (optional)
                </Typography>
                <Typography variant="body2" sx={{ color: PALETTE.inkLight, mb: 2 }}>
                  PDF, JPEG, or PNG · max 5 MB. Lab results, prescriptions, referral letters.
                </Typography>

                <Box
                  component="label"
                  htmlFor="doc-upload"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2.5,
                    border: `2px dashed ${docFile ? PALETTE.teal700 : PALETTE.sepia200}`,
                    borderRadius: 2,
                    background: docFile ? PALETTE.teal50 : PALETTE.cream,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    "&:hover": { borderColor: PALETTE.teal700, background: PALETTE.teal50 },
                  }}
                >
                  <input
                    id="doc-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    hidden
                    onChange={handleFileChange}
                  />
                  {docFile ? (
                    <AttachFileIcon sx={{ color: PALETTE.teal700 }} />
                  ) : (
                    <UploadFileIcon sx={{ color: PALETTE.inkLight }} />
                  )}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: docFile ? PALETTE.teal900 : PALETTE.inkMid }}
                    >
                      {docFile ? docFile.name : "Click to browse or drag & drop"}
                    </Typography>
                    {docFile && (
                      <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>
                        {(docFile.size / 1024).toFixed(1)} KB ·{" "}
                        <span
                          style={{ color: PALETTE.error, cursor: "pointer" }}
                          onClick={(e) => { e.preventDefault(); setDocFile(null); }}
                        >
                          Remove
                        </span>
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── Step 3: Confirm summary ───────────────────── */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="body1" sx={{ color: PALETTE.inkMid, mb: 2 }}>
                  Please review your appointment details before confirming.
                </Typography>

                {[
                  { label: "Doctor",       value: `Dr. ${doctorName}` },
                  { label: "Specialization", value: doctor?.specialization },
                  { label: "Location",     value: doctor?.location },
                  { label: "Date",         value: selectedDate?.format("dddd, DD MMM YYYY") },
                  { label: "Time",         value: selectedSlot },
                  { label: "Consultation Fee", value: `$${doctor?.fees}` },
                  { label: "Document",     value: docFile ? docFile.name : "None attached" },
                  { label: "Notes",        value: notes || "None" },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      py: 1.25,
                      borderBottom: `1px solid ${PALETTE.sepia100}`,
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        width: 140,
                        flexShrink: 0,
                        color: PALETTE.inkLight,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        mt: "2px",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: PALETTE.inkDark, fontWeight: 500 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {success ? (
          <Button variant="contained" onClick={handleClose} fullWidth>
            Done
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? handleClose : handleBack}
              disabled={loading}
            >
              {activeStep === 0 ? "Cancel" : "Back"}
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {activeStep < STEPS.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canNext()}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {loading ? "Booking…" : "Confirm Booking"}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
