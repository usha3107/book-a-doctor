import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, TextField, Button,
  MenuItem, Select, FormControl, InputLabel, Alert,
  CircularProgress, Avatar
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

import { authService } from "../../api/services";
import { PALETTE } from "../../theme";
import ProfilePictureUpload from "../../components/common/ProfilePictureUpload";

function OrnamentDivider() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 3 }}>
      <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
      <Typography sx={{ color: PALETTE.sepia200, fontSize: "1.2rem", lineHeight: 1 }}>✦</Typography>
      <Box sx={{ flex: 1, height: "1px", background: PALETTE.sepia200 }} />
    </Box>
  );
}

export default function PatientProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authService.getMe();
      const u = res.data.data.user;
      setUser(u);
      setForm({
        name: u.name || "",
        phone: u.phone || "",
        gender: u.gender || "",
        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : "",
        bloodGroup: u.bloodGroup || "",
        allergies: u.allergies || "",
        medicalHistory: u.medicalHistory || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePhotoUploaded = (updatedUser) => {
    setUser(updatedUser);
    setSuccess("Profile photo updated successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaveLoading(true);

    try {
      const payload = { ...form };
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      const res = await authService.updateProfile(payload);
      setUser(res.data.data.user);
      setSuccess("Profile saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 2 }}>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Patient Portal — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          My Profile & Medical Records
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Manage your personal and medical information securely for upcoming appointments.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.teal700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* Left Side — Profile Picture Upload */}
        <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${PALETTE.sepia200}`,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "transparent",
            }}
          >
            <ProfilePictureUpload
              currentPhoto={user?.profilePhoto}
              userName={user?.name}
              onUploadSuccess={handlePhotoUploaded}
            />
            <Typography variant="caption" sx={{ mt: 2, color: PALETTE.inkLight, textAlign: "center" }}>
              Upload a clear JPEG or PNG photo.
            </Typography>
          </Paper>
        </Grid>

        {/* Right Side — Profile Editing Form */}
        <Grid item xs={12} md={8}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Section 1: Personal details */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${PALETTE.sepia200}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <PersonOutlineIcon sx={{ color: PALETTE.teal700 }} />
                <Typography variant="h5" sx={{ fontStyle: "italic" }}>Personal Details</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user?.email || ""}
                    disabled
                    helperText="Email address cannot be changed."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="gender-select-label">Gender</InputLabel>
                    <Select
                      labelId="gender-select-label"
                      name="gender"
                      value={form.gender}
                      label="Gender"
                      onChange={handleInputChange}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Section 2: Clinical Summary */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${PALETTE.sepia200}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <MedicalServicesIcon sx={{ color: PALETTE.burgundy700 }} />
                <Typography variant="h5" sx={{ fontStyle: "italic" }}>Clinical Information</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="blood-select-label">Blood Group</InputLabel>
                    <Select
                      labelId="blood-select-label"
                      name="bloodGroup"
                      value={form.bloodGroup}
                      label="Blood Group"
                      onChange={handleInputChange}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Allergies"
                    name="allergies"
                    placeholder="E.g. Penicillin, Peanuts, Pollen (leave blank if none)"
                    value={form.allergies}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Chronic Conditions & Medical History"
                    name="medicalHistory"
                    placeholder="Describe any chronic illnesses, major surgeries, or ongoing treatments..."
                    value={form.medicalHistory}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saveLoading}
                startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : <SaveAltIcon />}
              >
                {saveLoading ? "Saving..." : "Save Profile Details"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
