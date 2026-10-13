import { createTheme, alpha } from '@mui/material/styles';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  // Primary — Professional blue
  primary: '#1a56db',
  primaryLight: '#3b82f6',
  primaryDark: '#1e40af',

  // Accent — Teal
  secondary: '#0891b2',
  secondaryLight: '#22d3ee',
  secondaryDark: '#0e7490',

  // Semantic
  success: '#059669',
  successLight: '#10b981',
  successDark: '#047857',
  warning: '#d97706',
  warningLight: '#f59e0b',
  warningDark: '#b45309',
  error: '#dc2626',
  errorLight: '#ef4444',
  errorDark: '#b91c1c',
  info: '#0284c7',
  infoLight: '#38bdf8',
  infoDark: '#0369a1',
};

const LIGHT = {
  bg: '#f0f4f8',
  paper: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  tableHead: '#f8fafc',
  tableRowHover: alpha(COLORS.primary, 0.025),
  inputBg: '#ffffff',
};

const DARK = {
  bg: '#0c1929',
  paper: '#152032',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: '#1e3a5f',
  borderStrong: '#2d5282',
  tableHead: alpha('#0c1929', 0.6),
  tableRowHover: alpha(COLORS.primary, 0.06),
  inputBg: alpha('#0c1929', 0.5),
};

export const getDialogPaperSx = (theme) => ({
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  backgroundImage: 'none',
  maxHeight: '90vh',
  boxShadow:
    theme.palette.mode === 'light'
      ? '0 20px 40px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15,23,42,0.04)'
      : '0 20px 40px -8px rgba(0, 0, 0, 0.6)',
});

export const getTheme = (mode) => {
  const isLight = mode === 'light';
  const T = isLight ? LIGHT : DARK;
  const divider = T.border;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: COLORS.primary,
        light: COLORS.primaryLight,
        dark: COLORS.primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: COLORS.secondary,
        light: COLORS.secondaryLight,
        dark: COLORS.secondaryDark,
        contrastText: '#ffffff',
      },
      success: {
        main: COLORS.success,
        light: COLORS.successLight,
        dark: COLORS.successDark,
      },
      warning: {
        main: COLORS.warning,
        light: COLORS.warningLight,
        dark: COLORS.warningDark,
      },
      error: {
        main: COLORS.error,
        light: COLORS.errorLight,
        dark: COLORS.errorDark,
      },
      info: {
        main: COLORS.info,
        light: COLORS.infoLight,
        dark: COLORS.infoDark,
      },
      background: {
        default: T.bg,
        paper: T.paper,
      },
      text: {
        primary: T.textPrimary,
        secondary: T.textSecondary,
        disabled: isLight ? '#94a3b8' : '#475569',
      },
      divider,
      action: {
        hover: isLight ? alpha(COLORS.primary, 0.04) : alpha('#e2e8f0', 0.06),
        selected: isLight ? alpha(COLORS.primary, 0.08) : alpha(COLORS.primaryLight, 0.12),
        disabledBackground: isLight ? '#f1f5f9' : '#1e293b',
        disabled: isLight ? '#94a3b8' : '#475569',
      },
    },

    // ─── Typography ──────────────────────────────────────────────────────────
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      fontWeightLight: 400,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 },
      h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
      h3: { fontSize: '1.25rem', fontWeight: 650, letterSpacing: '-0.015em', lineHeight: 1.35 },
      h4: { fontSize: '1.125rem', fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.4 },
      h5: { fontSize: '1rem', fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.45 },
      h6: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.5 },
      subtitle1: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4 },
      overline: { fontSize: '0.6875rem', fontWeight: 650, letterSpacing: '0.06em', lineHeight: 1.4 },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
    },

    shape: { borderRadius: 8 },

    // ─── Shadows ─────────────────────────────────────────────────────────────
    shadows: [
      'none',
      isLight ? '0 1px 2px rgba(15,23,42,0.06)' : '0 1px 2px rgba(0,0,0,0.3)',
      isLight ? '0 1px 4px rgba(15,23,42,0.08)' : '0 1px 4px rgba(0,0,0,0.35)',
      isLight ? '0 2px 8px rgba(15,23,42,0.08)' : '0 2px 8px rgba(0,0,0,0.4)',
      isLight ? '0 4px 12px rgba(15,23,42,0.1)' : '0 4px 12px rgba(0,0,0,0.45)',
      isLight ? '0 4px 16px rgba(15,23,42,0.1)' : '0 4px 16px rgba(0,0,0,0.5)',
      isLight ? '0 8px 24px rgba(15,23,42,0.1)' : '0 8px 24px rgba(0,0,0,0.5)',
      isLight ? '0 8px 32px rgba(15,23,42,0.12)' : '0 8px 32px rgba(0,0,0,0.55)',
      isLight ? '0 12px 40px rgba(15,23,42,0.12)' : '0 12px 40px rgba(0,0,0,0.6)',
      ...Array(16).fill('none'),
      isLight ? '0 20px 60px rgba(15,23,42,0.15)' : '0 20px 60px rgba(0,0,0,0.7)',
      ...Array(4).fill('none'),
    ],

    // ─── Component Overrides ─────────────────────────────────────────────────
    components: {

      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.2s ease, color 0.2s ease',
            backgroundColor: T.bg,
            color: T.textPrimary,
          },
          '*, *::before, *::after': { boxSizing: 'border-box' },
        },
      },

      // ── Button ──────────────────────────────────────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '7px 16px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            transition: 'all 0.15s ease',
            '&:focus-visible': {
              outline: `2px solid ${COLORS.primary}`,
              outlineOffset: 2,
            },
          },
          sizeLarge: { padding: '10px 22px', fontSize: '0.9375rem' },
          sizeMedium: { padding: '7px 16px' },
          sizeSmall: { padding: '4px 12px', fontSize: '0.8125rem', minHeight: 32 },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isLight
                ? '0 2px 8px rgba(26, 86, 219, 0.3)'
                : '0 2px 8px rgba(0,0,0,0.4)',
            },
            '&.Mui-disabled': {
              bgcolor: isLight ? '#e2e8f0' : '#1e293b',
              color: isLight ? '#94a3b8' : '#475569',
            },
          },
          outlined: {
            borderColor: divider,
            '&:hover': { borderColor: T.borderStrong },
          },
          text: {
            '&:hover': { bgcolor: isLight ? alpha(COLORS.primary, 0.05) : alpha(COLORS.primaryLight, 0.08) },
          },
        },
      },

      // ── IconButton ──────────────────────────────────────────────────────────
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.15s ease',
            '&:focus-visible': {
              outline: `2px solid ${COLORS.primary}`,
              outlineOffset: 2,
            },
          },
          sizeSmall: { padding: 6 },
        },
      },

      // ── Card ────────────────────────────────────────────────────────────────
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            border: `1px solid ${divider}`,
            boxShadow: isLight
              ? '0 1px 3px rgba(15, 23, 42, 0.04)'
              : '0 2px 8px rgba(0, 0, 0, 0.3)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          },
        },
      },

      // ── CardContent ─────────────────────────────────────────────────────────
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px',
            '&:last-child': { paddingBottom: '20px' },
          },
        },
      },

      // ── Paper ───────────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          elevation1: {
            boxShadow: isLight ? '0 1px 3px rgba(15,23,42,0.06)' : '0 1px 4px rgba(0,0,0,0.4)',
          },
        },
      },

      // ── AppBar ──────────────────────────────────────────────────────────────
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none', boxShadow: 'none' },
        },
      },

      // ── Drawer ──────────────────────────────────────────────────────────────
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: `1px solid ${divider}`,
          },
        },
      },

      // ── TableCell ───────────────────────────────────────────────────────────
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.045em',
            textTransform: 'uppercase',
            backgroundColor: isLight ? T.tableHead : T.tableHead,
            color: T.textSecondary,
            borderBottom: `1px solid ${divider}`,
            padding: '10px 14px',
            whiteSpace: 'nowrap',
          },
          body: {
            fontSize: '0.875rem',
            color: T.textPrimary,
            borderBottom: `1px solid ${isLight ? '#f1f5f9' : alpha(T.border, 0.5)}`,
            padding: '10px 14px',
          },
        },
      },

      // ── TableRow ────────────────────────────────────────────────────────────
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td, &:last-child th': { borderBottom: 0 },
            '&:hover td': {
              backgroundColor: isLight ? T.tableRowHover : T.tableRowHover,
            },
            transition: 'background-color 0.1s ease',
          },
        },
      },

      // ── TableHead ───────────────────────────────────────────────────────────
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root:hover td, & .MuiTableRow-root:hover th': {
              backgroundColor: 'transparent',
            },
          },
        },
      },

      // ── Backdrop ────────────────────────────────────────────────────────────
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: isLight
              ? alpha('#0f172a', 0.4)
              : alpha('#000000', 0.6),
            backdropFilter: 'blur(4px)',
          },
          invisible: { backdropFilter: 'none', backgroundColor: 'transparent' },
        },
      },

      // ── Dialog ──────────────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            backgroundImage: 'none',
            border: `1px solid ${divider}`,
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isLight
              ? '0 20px 40px -8px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(15,23,42,0.04)'
              : '0 20px 40px -8px rgba(0, 0, 0, 0.7)',
          },
        },
      },

      // ── DialogTitle ─────────────────────────────────────────────────────────
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.0625rem',
            fontWeight: 650,
            padding: '16px 20px',
            borderBottom: `1px solid ${divider}`,
            flexShrink: 0,
          },
        },
      },

      // ── DialogContent ───────────────────────────────────────────────────────
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '20px',
            '&.MuiDialogContent-root': {
              paddingTop: '20px',
            },
            overflowY: 'auto',
            flex: 1,
            '&.MuiDialogContent-dividers': { borderColor: divider },
          },
        },
      },

      // ── DialogActions ───────────────────────────────────────────────────────
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 20px',
            borderTop: `1px solid ${divider}`,
            backgroundColor: isLight ? T.tableHead : alpha(T.bg, 0.6),
            gap: 8,
            flexShrink: 0,
          },
        },
      },

      // ── OutlinedInput ───────────────────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: T.inputBg,
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: T.borderStrong,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.primary,
              borderWidth: 2,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.12)}`,
            },
            '&.Mui-error': {
              boxShadow: `0 0 0 3px ${alpha(COLORS.error, 0.12)}`,
            },
          },
          sizeSmall: { minHeight: 38 },
          input: {
            fontSize: '0.875rem',
            padding: '8px 12px',
            '&::placeholder': { color: T.textSecondary, opacity: 0.7 },
          },
          notchedOutline: {
            borderColor: isLight ? '#cbd5e1' : '#2d4a6a',
          },
        },
      },

      // ── InputLabel ──────────────────────────────────────────────────────────
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            color: T.textSecondary,
            '&.Mui-focused': { color: COLORS.primary },
          },
        },
      },

      // ── Select ──────────────────────────────────────────────────────────────
      MuiSelect: {
        styleOverrides: {
          select: {
            fontSize: '0.875rem',
            padding: '8px 12px',
          },
        },
      },

      // ── MenuItem ────────────────────────────────────────────────────────────
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            borderRadius: 6,
            margin: '1px 4px',
            padding: '7px 10px',
            '&:hover': {
              backgroundColor: isLight ? alpha(COLORS.primary, 0.06) : alpha(COLORS.primaryLight, 0.1),
            },
            '&.Mui-selected': {
              backgroundColor: isLight ? alpha(COLORS.primary, 0.1) : alpha(COLORS.primaryLight, 0.15),
              '&:hover': {
                backgroundColor: isLight ? alpha(COLORS.primary, 0.14) : alpha(COLORS.primaryLight, 0.2),
              },
            },
          },
        },
      },

      // ── Chip ────────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: 6,
            height: 26,
          },
          sizeSmall: { height: 22, fontSize: '0.7rem' },
          sizeMedium: { height: 28 },
        },
      },

      // ── Tabs ────────────────────────────────────────────────────────────────
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
            borderBottom: `1px solid ${divider}`,
          },
          indicator: {
            height: 2,
            borderRadius: '2px 2px 0 0',
            backgroundColor: COLORS.primary,
          },
        },
      },

      // ── Tab ─────────────────────────────────────────────────────────────────
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 44,
            padding: '8px 16px',
            color: T.textSecondary,
            '&.Mui-selected': { color: COLORS.primary },
          },
        },
      },

      // ── Menu ────────────────────────────────────────────────────────────────
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            border: `1px solid ${divider}`,
            boxShadow: isLight
              ? '0 8px 24px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(15,23,42,0.06)'
              : '0 8px 24px rgba(0, 0, 0, 0.5)',
            backgroundImage: 'none',
            padding: '4px',
          },
          list: { padding: '4px' },
        },
      },

      // ── Tooltip ─────────────────────────────────────────────────────────────
      MuiTooltip: {
        defaultProps: { arrow: true, enterDelay: 400 },
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 6,
            padding: '5px 10px',
            backgroundColor: isLight ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          arrow: {
            color: isLight ? '#1e293b' : '#0f172a',
          },
        },
      },

      // ── Accordion ───────────────────────────────────────────────────────────
      MuiAccordion: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            borderRadius: '10px !important',
            backgroundImage: 'none',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: 0 },
          },
        },
      },

      // ── AccordionSummary ────────────────────────────────────────────────────
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: 48,
            '&.Mui-expanded': { minHeight: 48 },
            borderRadius: '10px',
          },
          content: {
            margin: '10px 0',
            '&.Mui-expanded': { margin: '10px 0' },
          },
        },
      },

      // ── TextField ───────────────────────────────────────────────────────────
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
      },

      // ── FormControl ─────────────────────────────────────────────────────────
      MuiFormControl: {
        defaultProps: { variant: 'outlined', size: 'small' },
      },

      // ── FormHelperText ──────────────────────────────────────────────────────
      MuiFormHelperText: {
        styleOverrides: {
          root: { fontSize: '0.75rem', marginTop: 4 },
        },
      },

      // ── Alert ───────────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontSize: '0.875rem',
            border: '1px solid',
          },
          standardSuccess: {
            backgroundColor: isLight ? alpha(COLORS.success, 0.08) : alpha(COLORS.success, 0.15),
            borderColor: alpha(COLORS.success, 0.3),
            color: isLight ? COLORS.successDark : COLORS.successLight,
          },
          standardError: {
            backgroundColor: isLight ? alpha(COLORS.error, 0.08) : alpha(COLORS.error, 0.15),
            borderColor: alpha(COLORS.error, 0.3),
            color: isLight ? COLORS.errorDark : COLORS.errorLight,
          },
          standardWarning: {
            backgroundColor: isLight ? alpha(COLORS.warning, 0.08) : alpha(COLORS.warning, 0.15),
            borderColor: alpha(COLORS.warning, 0.3),
            color: isLight ? COLORS.warningDark : COLORS.warningLight,
          },
          standardInfo: {
            backgroundColor: isLight ? alpha(COLORS.info, 0.08) : alpha(COLORS.info, 0.15),
            borderColor: alpha(COLORS.info, 0.3),
            color: isLight ? COLORS.infoDark : COLORS.infoLight,
          },
        },
      },

      // ── Divider ─────────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: divider },
        },
      },

      // ── TableContainer ──────────────────────────────────────────────────────
      MuiTableContainer: {
        styleOverrides: {
          root: {
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: divider,
              borderRadius: '9999px',
            },
          },
        },
      },

      // ── TablePagination ─────────────────────────────────────────────────────
      MuiTablePagination: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            borderTop: `1px solid ${divider}`,
            color: T.textSecondary,
          },
          selectLabel: { fontSize: '0.8125rem' },
          displayedRows: { fontSize: '0.8125rem' },
        },
      },

      // ── LinearProgress ──────────────────────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 9999, backgroundColor: isLight ? '#e2e8f0' : '#1e3a5f' },
          bar: { borderRadius: 9999 },
        },
      },

      // ── Skeleton ────────────────────────────────────────────────────────────
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#e2e8f0' : '#1e3a5f',
            '&::after': {
              background: isLight
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            },
          },
        },
      },

      // ── Switch ──────────────────────────────────────────────────────────────
      MuiSwitch: {
        styleOverrides: {
          root: { borderRadius: 9999 },
          thumb: { boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
        },
      },

      // ── Checkbox ────────────────────────────────────────────────────────────
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: isLight ? '#94a3b8' : '#475569',
            '&.Mui-checked': { color: COLORS.primary },
          },
        },
      },

      // ── Radio ───────────────────────────────────────────────────────────────
      MuiRadio: {
        styleOverrides: {
          root: {
            color: isLight ? '#94a3b8' : '#475569',
            '&.Mui-checked': { color: COLORS.primary },
          },
        },
      },

      // ── ListItemButton ──────────────────────────────────────────────────────
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover': {
              backgroundColor: isLight ? alpha(COLORS.primary, 0.04) : alpha(COLORS.primaryLight, 0.06),
            },
            '&.Mui-selected': {
              backgroundColor: isLight ? alpha(COLORS.primary, 0.08) : alpha(COLORS.primaryLight, 0.12),
              '&:hover': {
                backgroundColor: isLight ? alpha(COLORS.primary, 0.12) : alpha(COLORS.primaryLight, 0.16),
              },
            },
          },
        },
      },
    },
  });
};
