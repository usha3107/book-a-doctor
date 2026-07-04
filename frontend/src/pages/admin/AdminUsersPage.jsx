// =============================================================
//  pages/admin/AdminUsersPage.jsx
// =============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Avatar, Button, TextField,
  InputAdornment, Alert, Chip, Pagination, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress,
} from "@mui/material";
import SearchIcon          from "@mui/icons-material/Search";
import PeopleOutlineIcon   from "@mui/icons-material/PeopleOutline";
import BlockIcon           from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { adminService }  from "../../api/services";
import { SectionLoader } from "../../components/common/Loaders";
import { PALETTE }       from "../../theme";
import dayjs             from "dayjs";

const TABS  = ["all", "user", "doctor", "admin"];
const LIMIT = 15;

const ROLE_CHIP = {
  user:   { bg: PALETTE.sepia100,    color: PALETTE.inkMid    },
  doctor: { bg: PALETTE.teal50,      color: PALETTE.teal900   },
  admin:  { bg: PALETTE.burgundy50,  color: PALETTE.burgundy700 },
};

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

export default function AdminUsersPage() {
  const [tabIndex,  setTabIndex]  = useState(0);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [users,     setUsers]     = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [successMsg,setSuccessMsg]= useState("");

  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);

  const activeType = TABS[tabIndex] === "all" ? undefined : TABS[tabIndex];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT, ...(activeType && { type: activeType }), ...(search && { search }) };
      const res = await adminService.getUsers(params);
      const { data: { users: us }, total: t, pages: p } = res.data;
      setUsers(us || []);
      setTotal(t || 0);
      setPages(p || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, activeType, search]);

  useEffect(() => { setPage(1); }, [activeType, search]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async () => {
    const { user, action } = confirmDialog;
    setActionLoading(true);
    try {
      if (action === "deactivate") {
        await adminService.deactivateUser(user._id);
        setSuccessMsg(`${user.name}'s account has been deactivated.`);
      } else {
        await adminService.activateUser(user._id);
        setSuccessMsg(`${user.name}'s account has been reactivated.`);
      }
      setConfirmDialog({ open: false, user: null, action: null });
      fetchUsers();
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
          User Management
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.25 }}>
          {total} registered account{total !== 1 ? "s" : ""} across all roles.
        </Typography>
        <Box sx={{ position: "absolute", bottom: -3, left: 0, width: "60px", height: "4px", background: PALETTE.burgundy700, borderRadius: 2 }} />
      </Box>

      <OrnamentDivider />

      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
      {error      && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Search */}
      <TextField
        fullWidth placeholder="Search by name or email…"
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
          sx={{ borderBottom: `1px solid ${PALETTE.sepia200}`, "& .MuiTabs-indicator": { backgroundColor: PALETTE.teal700, height: 3 } }}
        >
          {TABS.map((t) => (
            <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)}
              sx={{ textTransform: "none", fontFamily: "'Lato', sans-serif", fontWeight: 600 }} />
          ))}
        </Tabs>

        {loading ? <SectionLoader /> : users.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <PeopleOutlineIcon sx={{ fontSize: 52, color: PALETTE.sepia200, mb: 1.5 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>No users found</Typography>
            <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>Try adjusting your search or filter.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const roleStyle = ROLE_CHIP[u.type] || {};
                return (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: PALETTE.teal700, fontSize: "0.85rem", fontWeight: 700 }}>
                          {u.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.inkDark }}>{u.name}</Typography>
                          <Typography variant="caption">{u.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.type.toUpperCase()} size="small"
                        sx={{ fontFamily: "'Lato', sans-serif", fontSize: "0.7rem", fontWeight: 700, borderRadius: 2, height: 22, background: roleStyle.bg, color: roleStyle.color }}
                      />
                    </TableCell>
                    <TableCell><Typography variant="body2">{u.phone || "—"}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2">{dayjs(u.createdAt).format("DD MMM YYYY")}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.isActive ? "Active" : "Inactive"} size="small"
                        sx={{
                          fontFamily: "'Lato', sans-serif", fontSize: "0.7rem", fontWeight: 700, borderRadius: 2, height: 22,
                          background: u.isActive ? "rgba(58,107,74,0.1)" : PALETTE.sepia100,
                          color:      u.isActive ? PALETTE.success : PALETTE.inkLight,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {u.type !== "admin" && (
                        <Button
                          size="small" variant="outlined"
                          color={u.isActive ? "error" : "primary"}
                          startIcon={u.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                          onClick={() => setConfirmDialog({ open: true, user: u, action: u.isActive ? "deactivate" : "activate" })}
                          sx={{ fontSize: "0.75rem", py: 0.5 }}
                        >
                          {u.isActive ? "Deactivate" : "Reactivate"}
                        </Button>
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

      {/* Confirm dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null, action: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif" }}>
          {confirmDialog.action === "deactivate" ? "Deactivate Account?" : "Reactivate Account?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: PALETTE.inkMid }}>
            {confirmDialog.action === "deactivate"
              ? `${confirmDialog.user?.name} will no longer be able to sign in. You can reactivate the account at any time.`
              : `${confirmDialog.user?.name}'s account will be restored and they'll be able to sign in again.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog({ open: false, user: null, action: null })}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmDialog.action === "deactivate" ? "error" : "primary"}
            onClick={handleToggleActive}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
