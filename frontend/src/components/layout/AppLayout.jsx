// =============================================================
//  components/layout/AppLayout.jsx — Neo-Vintage Redesign
//
//  Changes:
//    • Notification bell with unread badge (actually rendered)
//    • Aged leather / warm sidebar with amber active glow
//    • Ornamental brand mark with medical cross
//    • Notification panel slide-in
// =============================================================

import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Drawer, Box, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Typography, Divider, Avatar, Tooltip, Badge, useMediaQuery,
  useTheme as useMuiTheme, Popover, CircularProgress,
} from "@mui/material";

import MenuIcon              from "@mui/icons-material/Menu";
import HomeOutlinedIcon      from "@mui/icons-material/HomeOutlined";
import CalendarMonthIcon     from "@mui/icons-material/CalendarMonth";
import SearchIcon            from "@mui/icons-material/Search";
import PersonOutlineIcon     from "@mui/icons-material/PersonOutline";
import PeopleOutlineIcon     from "@mui/icons-material/PeopleOutline";
import AssignmentIndIcon     from "@mui/icons-material/AssignmentInd";
import BarChartIcon          from "@mui/icons-material/BarChart";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DoneAllIcon           from "@mui/icons-material/DoneAll";
import LogoutIcon            from "@mui/icons-material/Logout";

import { useAuth }               from "../../context/AuthContext";
import { notificationService }   from "../../api/services";
import { PALETTE }               from "../../theme";

const DRAWER_WIDTH = 248;

// ── Medical cross SVG brand mark ──────────────────────────────
function MedCross({ size = 28, color = PALETTE.sepia200 }) {
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, height: size * 0.12, background: color, transform: "translateY(-50%)", borderRadius: 0.5 }} />
      <Box sx={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: size * 0.12, background: color, transform: "translateX(-50%)", borderRadius: 0.5 }} />
    </Box>
  );
}

// ── Nav items per role ────────────────────────────────────────
const NAV = {
  user: [
    { label: "Dashboard",      icon: <HomeOutlinedIcon />,  path: "/patient/dashboard"   },
    { label: "Find a Doctor",  icon: <SearchIcon />,        path: "/patient/search"      },
    { label: "Appointments",   icon: <CalendarMonthIcon />, path: "/patient/appointments"},
    { label: "My Profile",     icon: <PersonOutlineIcon />, path: "/patient/profile"     },
  ],
  doctor: [
    { label: "Dashboard",    icon: <HomeOutlinedIcon />,  path: "/doctor/dashboard"    },
    { label: "Appointments", icon: <CalendarMonthIcon />, path: "/doctor/appointments" },
    { label: "My Profile",   icon: <PersonOutlineIcon />, path: "/doctor/profile"      },
  ],
  admin: [
    { label: "Dashboard",          icon: <BarChartIcon />,      path: "/admin/dashboard"  },
    { label: "Users",              icon: <PeopleOutlineIcon />,  path: "/admin/users"      },
    { label: "Doctor Applications",icon: <AssignmentIndIcon />,  path: "/admin/doctors"    },
    { label: "Appointments",       icon: <CalendarMonthIcon />,  path: "/admin/appointments"},
  ],
};

// ── Notification Popover ──────────────────────────────────────
function NotificationPanel({ anchorEl, onClose, notifications, loading, onMarkAll }) {
  const open = Boolean(anchorEl);
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          width: 340,
          maxHeight: 420,
          background: PALETTE.parchment,
          border: `1px solid ${PALETTE.sepia200}`,
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.5, background: PALETTE.teal900, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: "'Playfair Display', serif", color: "#FFF", fontWeight: 700, fontSize: "0.95rem" }}>
          Notifications
        </Typography>
        <Tooltip title="Mark all as read">
          <IconButton size="small" onClick={onMarkAll} sx={{ color: "rgba(255,255,255,0.6)" }}>
            <DoneAllIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ overflowY: "auto", maxHeight: 360 }}>
        {loading ? (
          <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} sx={{ color: PALETTE.teal700 }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <NotificationsNoneIcon sx={{ fontSize: 40, color: PALETTE.sepia200, mb: 1 }} />
            <Typography variant="body2" sx={{ color: PALETTE.inkLight }}>
              No new notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((n, i) => (
            <React.Fragment key={n._id}>
              <Box
                sx={{
                  px: 2.5, py: 1.5,
                  background: n.isRead ? "transparent" : `${PALETTE.teal50}`,
                  borderLeft: n.isRead ? "3px solid transparent" : `3px solid ${PALETTE.teal700}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.82rem",
                    color: n.isRead ? PALETTE.inkLight : PALETTE.inkDark,
                    lineHeight: 1.5,
                  }}
                >
                  {n.message}
                </Typography>
                <Typography variant="caption" sx={{ color: PALETTE.inkLight, mt: 0.25, display: "block" }}>
                  {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </Typography>
              </Box>
              {i < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </Box>
    </Popover>
  );
}

// ── Sidebar content ───────────────────────────────────────────
function SidebarContent({ user, location, onNavigate }) {
  const navItems = NAV[user?.type] || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <MedCross size={26} color={PALETTE.sepia200} />
        <Box>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              color: "#FFFFFF", fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.1,
            }}
          >
            MedConsult
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Lato', sans-serif",
              color: `${PALETTE.sepia200}80`,
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Est. MCMXCVIII
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mx: 2.5, height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Nav items */}
      <List sx={{ pt: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => onNavigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  mb: 0.5,
                  position: "relative",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: active ? `3px solid ${PALETTE.sepia200}` : "3px solid transparent",
                  "&:hover": { background: "rgba(255,255,255,0.07)" },
                  "& .MuiListItemIcon-root": {
                    color: active ? PALETTE.sepia200 : "rgba(255,255,255,0.5)",
                    minWidth: 38,
                    transition: "color 0.2s",
                  },
                  "& .MuiListItemText-primary": {
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: active ? 700 : 400,
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                    letterSpacing: "0.03em",
                    transition: "color 0.2s",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mx: 2.5, height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* User footer */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          src={user?.profilePhoto
            ? `${process.env.REACT_APP_API_URL?.replace("/api/v1", "")}/${user.profilePhoto}`
            : undefined
          }
          sx={{
            width: 38, height: 38,
            background: PALETTE.burgundy700,
            fontFamily: "'Playfair Display', serif",
            fontSize: "0.95rem",
            fontWeight: 700,
            border: `2px solid rgba(255,255,255,0.15)`,
            filter: "sepia(15%)",
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Typography
            sx={{
              color: "#FFFFFF", fontFamily: "'Lato', sans-serif",
              fontSize: "0.83rem", fontWeight: 600,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {user?.name}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.45)", fontFamily: "'Lato', sans-serif",
              fontSize: "0.68rem", textTransform: "capitalize", letterSpacing: "0.1em",
            }}
          >
            {user?.type}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ── Main Layout ───────────────────────────────────────────────
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const muiTheme  = useMuiTheme();
  const isMobile  = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  // Notification state
  const [notifications,    setNotifications]    = useState([]);
  const [unreadCount,      setUnreadCount]      = useState(0);
  const [notifAnchor,      setNotifAnchor]      = useState(null);
  const [notifLoading,     setNotifLoading]     = useState(false);

  // Fetch unread count on mount and every 60 seconds
  useEffect(() => {
    const fetchCount = () => {
      notificationService.getUnreadCount()
        .then((res) => setUnreadCount(res.data.data.count))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifOpen = async (e) => {
    setNotifAnchor(e.currentTarget);
    setNotifLoading(true);
    try {
      const res = await notificationService.getAll({ limit: 10 });
      setNotifications(res.data.data.notifications);
    } catch (_) {}
    finally { setNotifLoading(false); }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <SidebarContent user={user} location={location} onNavigate={handleNavigate} />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ── AppBar (mobile only) ──────────────────────────── */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, display: { md: "none" } }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1.5 }}>
            <MenuIcon />
          </IconButton>
          <MedCross size={22} color="rgba(255,255,255,0.7)" />
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1.5, color: "#FFF", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            MedConsult
          </Typography>

          {/* Notification bell — mobile */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotifOpen}>
              <Badge badgeContent={unreadCount || 0} color="error" max={9}>
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Log out">
            <IconButton color="inherit" onClick={logout} sx={{ ml: 0.5 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Desktop Drawer ────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {/* Top-right controls: notification bell + logout */}
        <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 1, display: "flex", gap: 0.5 }}>
          <Tooltip title="Notifications">
            <IconButton size="small" onClick={handleNotifOpen} sx={{ color: "rgba(255,255,255,0.55)" }}>
              <Badge badgeContent={unreadCount || 0} color="error" max={9}>
                <NotificationsNoneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Log out">
            <IconButton size="small" onClick={logout} sx={{ color: "rgba(255,255,255,0.55)" }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {drawerContent}
      </Drawer>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ── Page content ──────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          background: PALETTE.cream,
          mt: { xs: "56px", md: 0 },
          p: { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Box>

      {/* ── Notification Popover ──────────────────────────── */}
      <NotificationPanel
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        notifications={notifications}
        loading={notifLoading}
        onMarkAll={handleMarkAll}
      />
    </Box>
  );
}
