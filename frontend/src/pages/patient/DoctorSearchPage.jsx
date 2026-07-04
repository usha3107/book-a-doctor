// =============================================================
//  pages/patient/DoctorSearchPage.jsx
//
//  Features:
//    • Live search by specialization and location (debounced 400 ms)
//    • Fee range filter
//    • Paginated grid of DoctorCard components
//    • Opens BookingModal on card action
//    • Empty / loading / error states
// =============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Grid, TextField, InputAdornment,
  Button, Slider, Paper, Divider, Pagination,
  Alert, Collapse, IconButton, Tooltip, FormControl,
  Select, MenuItem,
} from "@mui/material";
import SearchIcon          from "@mui/icons-material/Search";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FilterListIcon      from "@mui/icons-material/FilterList";
import CloseIcon           from "@mui/icons-material/Close";
import LocalHospitalIcon   from "@mui/icons-material/LocalHospital";

import { doctorService }   from "../../api/services";
import DoctorCard          from "../../components/common/DoctorCard";
import BookingModal        from "../../components/common/BookingModal";
import { SectionLoader }   from "../../components/common/Loaders";
import { PALETTE }         from "../../theme";

const LIMIT = 9; // cards per page

// Simple debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
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

export default function DoctorSearchPage() {
  // ── Filter state ──────────────────────────────────────────
  const [specialization, setSpecialization] = useState("");
  const [location,       setLocation]       = useState("");
  const [feeRange,       setFeeRange]       = useState([0, 500]);
  const [day,            setDay]            = useState("");
  const [showFilters,    setShowFilters]    = useState(false);
  const [page,           setPage]           = useState(1);

  // ── Data state ────────────────────────────────────────────
  const [doctors,  setDoctors]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // ── Booking modal state ───────────────────────────────────
  const [bookingDoctor, setBookingDoctor] = useState(null);

  // Debounce text inputs so we don't fire on every keystroke
  const debouncedSpec = useDebounce(specialization, 400);
  const debouncedLoc  = useDebounce(location, 400);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(debouncedSpec && { specialization: debouncedSpec }),
        ...(debouncedLoc  && { location: debouncedLoc }),
        minFee: feeRange[0],
        maxFee: feeRange[1],
        ...(day && { day }),
      };
      const res = await doctorService.search(params);
      // Backend returns: { success, count, total, page, pages, data: { doctors } }
      const { data: { doctors: docs }, total: t, pages: p } = res.data;
      setDoctors(docs || []);
      setTotal(t || 0);
      setPages(p || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSpec, debouncedLoc, feeRange, day]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [debouncedSpec, debouncedLoc, feeRange, day]);
  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleClearFilters = () => {
    setSpecialization("");
    setLocation("");
    setFeeRange([0, 500]);
    setDay("");
    setPage(1);
  };

  const hasActiveFilters =
    specialization || location || day || feeRange[0] > 0 || feeRange[1] < 500;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 2 }}>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <Box sx={{ mb: 1, pb: 3, borderBottom: `2px solid ${PALETTE.inkDark}`, position: "relative" }}>
        <Typography variant="overline" sx={{ color: PALETTE.teal700, letterSpacing: "0.22em", display: "block" }}>
          Patient Portal — MedConsult
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontStyle: "italic" }}>
          Find a Doctor
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          Browse our network of verified, experienced physicians.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.burgundy700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {/* ── Search bar row ────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by specialization…"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: PALETTE.inkLight, fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: specialization && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSpecialization("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          placeholder="Filter by location…"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnOutlinedIcon sx={{ color: PALETTE.inkLight, fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: location && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setLocation("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Fee range filter">
          <Button
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters((v) => !v)}
            sx={{ minWidth: 120, flexShrink: 0 }}
          >
            Filters
          </Button>
        </Tooltip>
      </Box>

      {/* ── Collapsible fee filter ────────────────────────── */}
      <Collapse in={showFilters}>
        <Paper
          elevation={0}
          sx={{
            p: 3, mb: 3,
            border: `1px solid ${PALETTE.sepia200}`,
            background: PALETTE.parchment,
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Typography variant="overline" sx={{ display: "block", mb: 2 }}>
                Consultation Fee Range
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={feeRange}
                  onChange={(_, v) => setFeeRange(v)}
                  min={0}
                  max={500}
                  step={10}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `$${v}`}
                  sx={{
                    color: PALETTE.teal700,
                    "& .MuiSlider-thumb": { background: PALETTE.teal700 },
                    "& .MuiSlider-track": { background: PALETTE.teal700 },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>
                    ${feeRange[0]}
                  </Typography>
                  <Typography variant="caption" sx={{ color: PALETTE.inkLight }}>
                    ${feeRange[1]}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" sx={{ display: "block", mb: 2 }}>
                Available Day of Week
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Any Day</MenuItem>
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Tuesday">Tuesday</MenuItem>
                  <MenuItem value="Wednesday">Wednesday</MenuItem>
                  <MenuItem value="Thursday">Thursday</MenuItem>
                  <MenuItem value="Friday">Friday</MenuItem>
                  <MenuItem value="Saturday">Saturday</MenuItem>
                  <MenuItem value="Sunday">Sunday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* ── Results meta row ──────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>
          {loading ? "Searching…" : `${total} doctor${total !== 1 ? "s" : ""} found`}
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<CloseIcon fontSize="small" />}
            onClick={handleClearFilters}
            sx={{ color: PALETTE.inkLight, fontSize: "0.78rem" }}
          >
            Clear filters
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ── Results grid ──────────────────────────────────── */}
      {loading ? (
        <SectionLoader />
      ) : doctors.length === 0 ? (
        <Box
          sx={{
            py: 10,
            textAlign: "center",
            border: `1px dashed ${PALETTE.sepia200}`,
            borderRadius: 2,
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 56, color: PALETTE.sepia200, mb: 1.5 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>
            No doctors found
          </Typography>
          <Typography variant="body2" sx={{ color: PALETTE.inkLight, mb: 2 }}>
            Try adjusting your search terms or clearing the filters.
          </Typography>
          <Button variant="outlined" onClick={handleClearFilters}>
            Clear all filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {doctors.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc._id}>
                <DoctorCard
                  doctor={doc}
                  onBook={(d) => setBookingDoctor(d)}
                />
              </Grid>
            ))}
          </Grid>

          {/* ── Pagination ──────────────────────────────── */}
          {pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <Pagination
                count={pages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                color="primary"
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* ── Booking modal ─────────────────────────────────── */}
      {bookingDoctor && (
        <BookingModal
          open={!!bookingDoctor}
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onBooked={() => {
            setBookingDoctor(null);
            // Optionally refresh the list or show a global snackbar
          }}
        />
      )}
    </Box>
  );
}
