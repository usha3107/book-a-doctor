// =============================================================
//  theme/index.js — Custom Vintage / Retro MUI Theme
//
//  Design brief: premium, trustworthy, classic medical feel.
//  Evokes a well-regarded clinic that has been in practice
//  for decades — not a startup, not a hospital bureaucracy.
//
//  Token system:
//    Palette  — warm cream backgrounds, deep teal, aged burgundy, sepia
//    Typography — Playfair Display (headings) + Lora (body)
//    Shape    — subtle rounding, nothing hyper-modern
//    Shadows  — soft, warm-tinted
//    Components — global MUI overrides that enforce the style
// =============================================================

import { createTheme, alpha } from "@mui/material/styles";

// ── Color tokens ──────────────────────────────────────────────
export const PALETTE = {
  // Backgrounds
  cream:      "#FAF9F6",   // base page background
  parchment:  "#F2EFE7",   // card / surface
  sepia100:   "#EDE8DC",   // dividers, subtle fills
  sepia200:   "#D9D0BC",   // borders

  // Primary — muted teal (clinical authority with warmth)
  teal900:    "#1B4A52",
  teal800:    "#215F69",
  teal700:    "#267480",   // main primary
  teal600:    "#2E8C9A",
  teal100:    "#D6ECEF",
  teal50:     "#EBF5F7",

  // Secondary — aged burgundy (warmth, heritage)
  burgundy900:"#4A1528",
  burgundy700:"#7B2D42",   // main secondary
  burgundy500:"#A63D58",
  burgundy100:"#F0D4DA",
  burgundy50: "#F8EDF0",

  // Accents
  gold:       "#B8973B",   // stars, highlights
  goldLight:  "#F5EDD3",

  // Neutrals
  inkDark:    "#1C1C1A",   // primary text
  inkMid:     "#3D3D38",   // secondary text
  inkLight:   "#6B6860",   // placeholder / caption
  rule:       "#C8C2B4",   // horizontal rules

  // Status (desaturated to stay warm)
  success:    "#3A6B4A",
  warning:    "#8C6820",
  error:      "#8C2D2D",
  info:       "#267480",
};

// ── Base theme (no component overrides yet) ───────────────────
const baseTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: PALETTE.cream,
      paper:   PALETTE.parchment,
    },
    primary: {
      main:         PALETTE.teal700,
      dark:         PALETTE.teal900,
      light:        PALETTE.teal600,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main:         PALETTE.burgundy700,
      dark:         PALETTE.burgundy900,
      light:        PALETTE.burgundy500,
      contrastText: "#FFFFFF",
    },
    text: {
      primary:   PALETTE.inkDark,
      secondary: PALETTE.inkMid,
      disabled:  PALETTE.inkLight,
    },
    divider: PALETTE.sepia200,
    success: { main: PALETTE.success },
    warning: { main: PALETTE.warning },
    error:   { main: PALETTE.error },
    info:    { main: PALETTE.info },
  },

  typography: {
    // Load via Google Fonts in public/index.html
    fontFamily: "'Lora', 'Georgia', serif",
    fontSize: 15,

    h1: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontWeight: 700,
      fontSize: "clamp(2rem, 5vw, 3.25rem)",
      lineHeight: 1.18,
      letterSpacing: "-0.02em",
      color: PALETTE.inkDark,
    },
    h2: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontWeight: 700,
      fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
      lineHeight: 1.22,
      letterSpacing: "-0.015em",
      color: PALETTE.inkDark,
    },
    h3: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontWeight: 600,
      fontSize: "clamp(1.3rem, 2.5vw, 1.85rem)",
      lineHeight: 1.28,
      letterSpacing: "-0.01em",
      color: PALETTE.inkDark,
    },
    h4: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontWeight: 600,
      fontSize: "1.4rem",
      lineHeight: 1.32,
      color: PALETTE.inkDark,
    },
    h5: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontWeight: 600,
      fontSize: "1.15rem",
      lineHeight: 1.4,
      color: PALETTE.inkDark,
    },
    h6: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.45,
      color: PALETTE.inkDark,
    },
    subtitle1: {
      fontFamily: "'Lora', 'Georgia', serif",
      fontSize: "1rem",
      fontStyle: "italic",
      lineHeight: 1.6,
      color: PALETTE.inkMid,
    },
    subtitle2: {
      fontFamily: "'Lora', 'Georgia', serif",
      fontSize: "0.875rem",
      fontStyle: "italic",
      color: PALETTE.inkLight,
    },
    body1: {
      fontFamily: "'Lora', 'Georgia', serif",
      fontSize: "0.975rem",
      lineHeight: 1.75,
      color: PALETTE.inkMid,
    },
    body2: {
      fontFamily: "'Lora', 'Georgia', serif",
      fontSize: "0.875rem",
      lineHeight: 1.65,
      color: PALETTE.inkLight,
    },
    // Utility / UI labels — switch to a sans-serif for legibility
    button: {
      fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
      fontWeight: 600,
      fontSize: "0.875rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    caption: {
      fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
      fontSize: "0.78rem",
      letterSpacing: "0.06em",
      color: PALETTE.inkLight,
    },
    overline: {
      fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
      fontSize: "0.72rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: PALETTE.teal700,
    },
  },

  shape: {
    borderRadius: 4,   // deliberately restrained — not pill-shaped
  },

  spacing: 8,

  // Warm-tinted shadows (replace the cold MUI defaults)
  shadows: [
    "none",
    `0 1px 3px ${alpha(PALETTE.inkDark, 0.08)}`,
    `0 2px 6px ${alpha(PALETTE.inkDark, 0.09)}`,
    `0 4px 12px ${alpha(PALETTE.inkDark, 0.10)}`,
    `0 6px 16px ${alpha(PALETTE.inkDark, 0.11)}`,
    `0 8px 24px ${alpha(PALETTE.inkDark, 0.12)}`,
    `0 10px 28px ${alpha(PALETTE.inkDark, 0.13)}`,
    `0 12px 32px ${alpha(PALETTE.inkDark, 0.14)}`,
    `0 14px 36px ${alpha(PALETTE.inkDark, 0.15)}`,
    `0 16px 40px ${alpha(PALETTE.inkDark, 0.15)}`,
    `0 18px 44px ${alpha(PALETTE.inkDark, 0.16)}`,
    `0 20px 48px ${alpha(PALETTE.inkDark, 0.16)}`,
    `0 22px 52px ${alpha(PALETTE.inkDark, 0.17)}`,
    `0 24px 56px ${alpha(PALETTE.inkDark, 0.17)}`,
    `0 26px 60px ${alpha(PALETTE.inkDark, 0.18)}`,
    `0 28px 64px ${alpha(PALETTE.inkDark, 0.18)}`,
    `0 30px 68px ${alpha(PALETTE.inkDark, 0.19)}`,
    `0 32px 72px ${alpha(PALETTE.inkDark, 0.19)}`,
    `0 34px 76px ${alpha(PALETTE.inkDark, 0.20)}`,
    `0 36px 80px ${alpha(PALETTE.inkDark, 0.20)}`,
    `0 38px 84px ${alpha(PALETTE.inkDark, 0.21)}`,
    `0 40px 88px ${alpha(PALETTE.inkDark, 0.21)}`,
    `0 42px 92px ${alpha(PALETTE.inkDark, 0.22)}`,
    `0 44px 96px ${alpha(PALETTE.inkDark, 0.22)}`,
    `0 46px 100px ${alpha(PALETTE.inkDark, 0.23)}`,
  ],
});

// ── Full theme with component overrides ───────────────────────
const theme = createTheme(baseTheme, {
  components: {

    // ── MuiCssBaseline ───────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": { boxSizing: "border-box" },
        html: { scrollBehavior: "smooth" },
        body: {
          background: PALETTE.cream,
          color: PALETTE.inkMid,
        },
        // Subtle scrollbar styling
        "::-webkit-scrollbar": { width: 8 },
        "::-webkit-scrollbar-track": { background: PALETTE.sepia100 },
        "::-webkit-scrollbar-thumb": {
          background: PALETTE.sepia200,
          borderRadius: 4,
        },
        "::-webkit-scrollbar-thumb:hover": { background: PALETTE.inkLight },
        // Links
        a: { color: PALETTE.teal700, textDecoration: "none" },
        "a:hover": { textDecoration: "underline" },
      },
    },

    // ── MuiButton ────────────────────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 3,
          padding: "10px 24px",
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PALETTE.teal700} 0%, ${PALETTE.teal900} 100%)`,
          border: `1px solid ${PALETTE.teal900}`,
          "&:hover": {
            background: `linear-gradient(135deg, ${PALETTE.teal800} 0%, ${PALETTE.teal900} 100%)`,
            boxShadow: `0 4px 14px ${alpha(PALETTE.teal700, 0.35)}`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${PALETTE.burgundy700} 0%, ${PALETTE.burgundy900} 100%)`,
          border: `1px solid ${PALETTE.burgundy900}`,
          "&:hover": {
            boxShadow: `0 4px 14px ${alpha(PALETTE.burgundy700, 0.35)}`,
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": { borderWidth: "1.5px" },
        },
        outlinedPrimary: {
          borderColor: PALETTE.teal700,
          color: PALETTE.teal700,
          "&:hover": {
            background: PALETTE.teal50,
            borderColor: PALETTE.teal900,
            color: PALETTE.teal900,
          },
        },
        text: {
          "&:hover": { background: PALETTE.sepia100 },
        },
      },
    },

    // ── MuiCard ──────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          background: PALETTE.parchment,
          border: `1px solid ${PALETTE.sepia200}`,
          borderRadius: 6,
          boxShadow: `0 2px 8px ${alpha(PALETTE.inkDark, 0.07)}`,
          transition: "box-shadow 0.25s ease, transform 0.25s ease",
          "&:hover": {
            boxShadow: `0 6px 20px ${alpha(PALETTE.inkDark, 0.12)}`,
          },
        },
      },
    },

    // ── MuiPaper ─────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          background: PALETTE.parchment,
          backgroundImage: "none",
        },
        outlined: {
          borderColor: PALETTE.sepia200,
        },
      },
    },

    // ── MuiTextField / Input ──────────────────────────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: alpha(PALETTE.cream, 0.7),
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.sepia200,
            borderWidth: "1.5px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.teal700,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.teal700,
            borderWidth: "2px",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'Lato', sans-serif",
          fontSize: "0.875rem",
          color: PALETTE.inkLight,
          "&.Mui-focused": { color: PALETTE.teal700 },
        },
      },
    },

    // ── MuiChip ──────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Lato', sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.04em",
          borderRadius: 3,
        },
        colorPrimary: {
          background: PALETTE.teal50,
          color: PALETTE.teal900,
          border: `1px solid ${PALETTE.teal100}`,
        },
        colorSecondary: {
          background: PALETTE.burgundy50,
          color: PALETTE.burgundy900,
          border: `1px solid ${PALETTE.burgundy100}`,
        },
      },
    },

    // ── MuiAppBar ────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: PALETTE.teal900,
          boxShadow: `0 2px 12px ${alpha(PALETTE.inkDark, 0.25)}`,
          borderBottom: `1px solid ${PALETTE.teal800}`,
        },
      },
    },

    // ── MuiDrawer ────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: PALETTE.teal900,
          borderRight: `1px solid ${PALETTE.teal800}`,
          color: "#FFFFFF",
        },
      },
    },

    // ── MuiListItemButton ─────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: "2px 8px",
          width: "calc(100% - 16px)",
          transition: "background 0.2s",
          "&.Mui-selected": {
            background: alpha("#FFFFFF", 0.12),
            "&:hover": { background: alpha("#FFFFFF", 0.18) },
          },
          "&:hover": { background: alpha("#FFFFFF", 0.08) },
        },
      },
    },

    // ── MuiAlert ─────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontFamily: "'Lora', serif",
          fontSize: "0.9rem",
          border: "1px solid",
        },
        standardSuccess: {
          background: alpha(PALETTE.success, 0.08),
          borderColor: alpha(PALETTE.success, 0.25),
          color: PALETTE.success,
        },
        standardError: {
          background: alpha(PALETTE.error, 0.08),
          borderColor: alpha(PALETTE.error, 0.25),
          color: PALETTE.error,
        },
        standardWarning: {
          background: alpha(PALETTE.warning, 0.08),
          borderColor: alpha(PALETTE.warning, 0.25),
          color: PALETTE.warning,
        },
        standardInfo: {
          background: alpha(PALETTE.info, 0.08),
          borderColor: alpha(PALETTE.info, 0.25),
          color: PALETTE.info,
        },
      },
    },

    // ── MuiDivider ───────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: PALETTE.sepia200 },
      },
    },

    // ── MuiTableHead ─────────────────────────────────────────
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            background: PALETTE.sepia100,
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "0.78rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: PALETTE.inkMid,
            borderBottom: `2px solid ${PALETTE.sepia200}`,
          },
        },
      },
    },

    // ── MuiTableRow ──────────────────────────────────────────
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even) td": {
            background: alpha(PALETTE.sepia100, 0.4),
          },
          "&:hover td": {
            background: alpha(PALETTE.teal50, 0.6),
          },
        },
      },
    },

    // ── MuiTooltip ───────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: "'Lato', sans-serif",
          fontSize: "0.78rem",
          background: PALETTE.inkDark,
          borderRadius: 3,
        },
      },
    },

    // ── MuiTab / Tabs ─────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "'Lato', sans-serif",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
          minHeight: 48,
        },
      },
    },

    // ── MuiBadge ─────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontFamily: "'Lato', sans-serif",
          fontWeight: 700,
          fontSize: "0.65rem",
        },
      },
    },
  },
});

export default theme;
