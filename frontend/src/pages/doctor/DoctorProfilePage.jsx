// =============================================================
//  pages/doctor/DoctorProfilePage.jsx
//
//  Two-panel page:
//    Left  — edit professional profile fields
//    Right — manage weekly availability slots
// =============================================================

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, TextField, Button,
  Divider, Alert, FormControl, InputLabel, Select,
  MenuItem, IconButton, Chip, CircularProgress,
} from "@mui/material";
import SaveOutlinedIcon        from "@mui/icons-material/SaveOutlined";
import AddCircleOutlineIcon    from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon       from "@mui/icons-material/DeleteOutline";
import MedicalInformationIcon  from "@mui/icons-material/MedicalInformation";
import AccessTimeIcon          from "@mui/icons-material/AccessTime";

import { doctorService }         from "../../api/services";
import { useAuth }               from "../../context/AuthContext";
import { SectionLoader }         from "../../components/common/Loaders";
import ProfilePictureUpload      from "../../components/common/ProfilePictureUpload";
import { PALETTE }               from "../../theme";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIME_OPTIONS = [];
for (let h = 6; h <= 21; h++) {
  ["00","30"].forEach((m) => {
    TIME_OPTIONS.push(`${String(h).padStart(2,"0")}:${m}`);
  });
}
const SPECIALIZATIONS = [
  "General Practice","Cardiology","Dermatology","Endocrinology",
  "Gastroenterology","Gynaecology","Haematology","Nephrology",
  "Neurology","Oncology","Ophthalmology","Orthopaedics",
  "Paediatrics","Psychiatry","Pulmonology","Radiology",
  "Rheumatology","Surgery","Urology","Other",
];

export default function DoctorProfilePage() {
  const { user, refreshUser } = useAuth();

  const [doctor,        setDoctor]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [profileLoading,setProfileLoading]= useState(false);
  const [timingsLoading,setTimingsLoading]= useState(false);
  const [profileMsg,    setProfileMsg]    = useState({ type: "", text: "" });
  const [timingsMsg,    setTimingsMsg]    = useState({ type: "", text: "" });

  // Profile form state
  const [profile, setProfile] = useState({
    specialization: "", location: "", experience: "", fees: "", bio: "",
  });

  // Timings state
  const [timings, setTimings] = useState([]);

  // ── Load doctor profile ───────────────────────────────────
  useEffect(() => {
    doctorService.getMyProfile()
      .then((res) => {
        const d = res.data.data.doctor;
        setDoctor(d);
        setProfile({
          specialization: d.specialization || "",
          location:       d.location       || "",
          experience:     d.experience     ?? "",
          fees:           d.fees           ?? "",
          bio:            d.bio            || "",
        });
        setTimings(d.timings?.length > 0 ? d.timings : [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]);
      })
      .catch(() => {
        setTimings([{ day: "Monday", startTime: "09:00", endTime: "17:00" }]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save profile ──────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setProfileLoading(true);
    try {
      await doctorService.updateMyProfile({
        ...profile,
        experience: Number(profile.experience),
        fees:       Number(profile.fees),
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Save timings ──────────────────────────────────────────
  const handleSaveTimings = async () => {
    setTimingsMsg({ type: "", text: "" });

    for (const t of timings) {
      if (t.startTime >= t.endTime) {
        setTimingsMsg({ type: "error", text: `On ${t.day}: start time must be before end time.` });
        return;
      }
    }

    setTimingsLoading(true);
    try {
      await doctorService.updateTimings({ timings });
      setTimingsMsg({ type: "success", text: "Availability schedule updated." });
    } catch (err) {
      setTimingsMsg({ type: "error", text: err.message });
    } finally {
      setTimingsLoading(false);
    }
  };

  const addTiming = () =>
    setTimings((p) => [...p, { day: "Monday", startTime: "09:00", endTime: "17:00" }]);
  const removeTiming = (i) =>
    setTimings((p) => p.filter((_, idx) => idx !== i));
  const updateTiming = (i, field, value) =>
    setTimings((p) => p.map((t, idx) => idx === i ? { ...t, [field]: value } : t));

  if (loading) return <SectionLoader />;

  return (
    <Box sx={{ maxWidth: 1050, mx: "auto", py: 2 }}>

      {/* ── Neo-Vintage Masthead ─────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative", display: "flex", alignItems: "flex-end", gap: 4, flexWrap: "wrap" }}>
        {/* Profile photo upload section */}
        <Box sx={{ flexShrink: 0 }}>
          <ProfilePictureUpload
            currentPhoto={doctor?.profilePhoto}
            serviceFn={doctorService.uploadPhoto}
            onSuccess={(updated) => {
              setDoctor((d) => ({ ...d, profilePhoto: updated?.profilePhoto }));
            }}
            userName={user?.name || ""}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
            Doctor Portal — MedConsult
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
            Dr. {user?.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.75 }}>
            <Chip
              label={doctor?.status?.toUpperCase() || "PENDING"}
              size="small"
              sx={{
                fontFamily: "'Lato', sans-serif", fontSize: "0.7rem", fontWeight: 700,
                background: doctor?.status === "approved" ? PALETTE.teal50 : PALETTE.goldLight,
                color: doctor?.status === "approved" ? PALETTE.teal900 : PALETTE.warning,
                border: `1px solid ${doctor?.status === "approved" ? PALETTE.teal100 : "#D4A84B"}`,
              }}
            />
            {doctor?.specialization && (
              <Typography variant="body2" sx={{ color: PALETTE.inkLight, fontStyle: "italic" }}>
                {doctor.specialization}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.teal700, borderRadius: 2 }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 3 }}>
        <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
        <Typography sx={{ color: PALETTE.sepia200, fontSize: "1.2rem" }}>✦</Typography>
        <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
      </Box>

      <Grid container spacing={3}>
        {/* ── Left: Professional Profile ──────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${PALETTE.sepia200}`, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
              <MedicalInformationIcon sx={{ color: PALETTE.teal700 }} />
              <Typography variant="h5">Professional Details</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {profileMsg.text && (
              <Alert severity={profileMsg.type} sx={{ mb: 2 }} onClose={() => setProfileMsg({ type: "", text: "" })}>
                {profileMsg.text}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSaveProfile} noValidate>
              <FormControl fullWidth required sx={{ mb: 2.5 }}>
                <InputLabel>Specialization</InputLabel>
                <Select
                  label="Specialization"
                  value={profile.specialization}
                  onChange={(e) => setProfile((p) => ({ ...p, specialization: e.target.value }))}
                >
                  {SPECIALIZATIONS.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontFamily: "'Lora', serif", fontSize: "0.9rem" }}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth required label="Practice Location" sx={{ mb: 2.5 }}
                value={profile.location}
                onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
              />

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth required label="Years Experience" type="number"
                    inputProps={{ min: 0, max: 60 }}
                    value={profile.experience}
                    onChange={(e) => setProfile((p) => ({ ...p, experience: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth required label="Fee (USD)" type="number"
                    inputProps={{ min: 0, step: 5 }}
                    value={profile.fees}
                    onChange={(e) => setProfile((p) => ({ ...p, fees: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth multiline rows={4} label="Professional Bio"
                sx={{ mb: 3 }}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                inputProps={{ maxLength: 1000 }}
                helperText={`${profile.bio.length}/1000`}
              />

              <Button
                type="submit" variant="contained" fullWidth
                disabled={profileLoading}
                startIcon={profileLoading
                  ? <CircularProgress size={16} color="inherit" />
                  : <SaveOutlinedIcon />}
              >
                {profileLoading ? "Saving…" : "Save Profile"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* ── Right: Availability ──────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${PALETTE.sepia200}`, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon sx={{ color: PALETTE.teal700 }} />
                <Typography variant="h5">Availability</Typography>
              </Box>
              <Button
                size="small" variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addTiming}
                disabled={timings.length >= 14}
              >
                Add
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {timingsMsg.text && (
              <Alert severity={timingsMsg.type} sx={{ mb: 2 }} onClose={() => setTimingsMsg({ type: "", text: "" })}>
                {timingsMsg.text}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
              {timings.map((t, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex", gap: 1, alignItems: "center",
                    p: 1.5,
                    background: i % 2 === 0 ? PALETTE.cream : PALETTE.parchment,
                    border: `1px solid ${PALETTE.sepia100}`,
                    borderRadius: 2,
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <Select
                      value={t.day}
                      onChange={(e) => updateTiming(i, "day", e.target.value)}
                    >
                      {DAYS.map((d) => (
                        <MenuItem key={d} value={d} sx={{ fontFamily: "'Lora', serif", fontSize: "0.875rem" }}>
                          {d.slice(0, 3)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 86 }}>
                    <Select value={t.startTime} onChange={(e) => updateTiming(i, "startTime", e.target.value)}>
                      {TIME_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontFamily: "'Lato', sans-serif", fontSize: "0.8rem" }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>–</Typography>

                  <FormControl size="small" sx={{ minWidth: 86 }}>
                    <Select
                      value={t.endTime}
                      onChange={(e) => updateTiming(i, "endTime", e.target.value)}
                    >
                      {TIME_OPTIONS.filter((opt) => opt > t.startTime).map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontFamily: "'Lato', sans-serif", fontSize: "0.8rem" }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ flexGrow: 1 }} />

                  <IconButton
                    size="small"
                    onClick={() => removeTiming(i)}
                    disabled={timings.length === 1}
                    sx={{ color: PALETTE.error }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained" fullWidth
              onClick={handleSaveTimings}
              disabled={timingsLoading}
              startIcon={timingsLoading
                ? <CircularProgress size={16} color="inherit" />
                : <SaveOutlinedIcon />}
            >
              {timingsLoading ? "Saving…" : "Save Schedule"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
