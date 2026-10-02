import { createTheme, alpha } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#3b82f6', // Bright, modern blue
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#10b981', // Emerald green
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      background: {
        default: isLight ? '#f8fafc' : '#0f172a',
        paper: isLight ? '#ffffff' : '#1e293b',
      },
      text: {
        primary: isLight ? '#0f172a' : '#f8fafc',
        secondary: isLight ? '#64748b' : '#94a3b8',
      },
      divider: isLight ? '#e2e8f0' : '#334155',
    },
    typography: {
      fontFamily: '"Inter", "Outfit", "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' },
      h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.125rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
            backgroundColor: isLight ? '#f8fafc' : '#0f172a',
            color: isLight ? '#0f172a' : '#f8fafc',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.2s ease',
            textTransform: 'none',
          },
          contained: {
            boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.3)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isLight ? '0 4px 6px rgba(0,0,0,0.12)' : '0 4px 10px rgba(0,0,0,0.4)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            border: `1px solid ${isLight ? '#e2e8f0' : '#334155'}`,
            boxShadow: isLight 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${isLight ? '#e2e8f0' : '#334155'}`,
            color: isLight ? '#0f172a' : '#f8fafc',
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? '#ffffff' : '#1e293b',
            borderRight: `1px solid ${isLight ? '#e2e8f0' : '#334155'}`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: isLight ? '#f1f5f9' : '#0f172a',
            color: isLight ? '#475569' : '#cbd5e1',
            borderBottom: `1px solid ${isLight ? '#e2e8f0' : '#334155'}`,
          },
          body: {
            borderBottom: `1px solid ${isLight ? '#f1f5f9' : '#1e293b'}`,
            color: isLight ? '#1e293b' : '#e2e8f0',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: isLight ? '#f8fafc' : '#334155',
            },
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            marginTop: '48px',
            backgroundColor: isLight ? '#ffffff' : '#1e293b',
            backgroundImage: 'none',
            border: `1px solid ${isLight ? '#e2e8f0' : '#334155'}`,
            boxShadow: isLight
              ? '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.2rem',
            fontWeight: 750,
            letterSpacing: '-0.015em',
            padding: '20px 24px',
            color: isLight ? '#0f172a' : '#f8fafc',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '24px',
            color: isLight ? '#334155' : '#cbd5e1',
            '&.MuiDialogContent-dividers': {
              borderColor: isLight ? '#e2e8f0' : '#334155',
            },
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
            borderTop: `1px solid ${isLight ? '#f1f5f9' : '#334155'}`,
            backgroundColor: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)',
            gap: '10px',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          sizeSmall: {
            height: '40px', // Uniform height for all small text/date fields
          },
          input: {
            color: isLight ? '#0f172a' : '#f8fafc', // Ensure typed/selected value is always visible
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            color: isLight ? '#0f172a' : '#f8fafc', // Ensure selected option text is always visible
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          sizeSmall: {
            height: '40px', // Match button height to text fields in filter bars
          },
        },
      },
    },
  });
};
