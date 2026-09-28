/**
 * Centralized Filter Theme & Constants for RISHERP
 * Single source of truth for all filter drawer dimensions, colors, tokens, and presets.
 */

export const FILTER_DRAWER_WIDTH = 580;

export const FILTER_DRAWER_SX = {
  width: {
    xs: '100vw',
    sm: 'min(580px, 90vw)',
    md: `${FILTER_DRAWER_WIDTH}px`,
  },
  maxWidth: '100vw',
};

export const QUICK_DATE_PRESETS = [
  { label: 'Today', value: 'TODAY' },
  { label: 'Yesterday', value: 'YESTERDAY' },
  { label: 'This Week', value: 'THIS_WEEK' },
  { label: 'This Month', value: 'THIS_MONTH' },
  { label: 'This Year', value: 'THIS_YEAR' },
  { label: 'All Dates', value: 'ALL' },
];

/**
 * Calculates start (from) and end (to) date strings (YYYY-MM-DD) for a given preset
 */
export const calculatePresetRange = (preset) => {
  const today = new Date();
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let from = '';
  let to = '';

  if (preset === 'TODAY') {
    from = formatDate(today);
    to = formatDate(today);
  } else if (preset === 'YESTERDAY') {
    const yest = new Date(today);
    yest.setDate(today.getDate() - 1);
    from = formatDate(yest);
    to = formatDate(yest);
  } else if (preset === 'THIS_WEEK') {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(today);
    monday.setDate(diff);
    from = formatDate(monday);
    to = formatDate(new Date());
  } else if (preset === 'THIS_MONTH') {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    from = formatDate(firstDay);
    to = formatDate(new Date());
  } else if (preset === 'THIS_YEAR') {
    const firstDay = new Date(today.getFullYear(), 0, 1);
    from = formatDate(firstDay);
    to = formatDate(new Date());
  } else if (preset === 'ALL') {
    from = '';
    to = '';
  }

  return { from, to };
};

/**
 * Centralized SX styling for filter controls (TextFields, Selects, Inputs)
 * Deeply integrates with RISHERP dark and light mode palette.
 */
export const getStandardControlSx = (theme) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    '& .MuiOutlinedInput-root': {
      height: '42px',
      borderRadius: '8px',
      bgcolor: isDark ? '#0f172a !important' : '#ffffff !important',
      color: isDark ? '#f8fafc !important' : '#0f172a !important',
      fontSize: '0.875rem',
      transition: 'all 0.15s ease',
      '& fieldset': {
        borderColor: isDark ? '#334155 !important' : '#cbd5e1 !important',
      },
      '&:hover fieldset': {
        borderColor: isDark ? '#60a5fa !important' : '#3b82f6 !important',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6 !important',
        borderWidth: '1.5px !important',
      },
      '& input': {
        color: isDark ? '#f8fafc !important' : '#0f172a !important',
        '&::placeholder': {
          color: isDark ? '#64748b !important' : '#94a3b8 !important',
          opacity: 1,
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: isDark ? '#94a3b8 !important' : '#475569 !important',
      fontSize: '0.875rem',
      '&.Mui-focused': {
        color: '#3b82f6 !important',
      },
    },
    '& .MuiSelect-select': {
      color: isDark ? '#f8fafc !important' : '#0f172a !important',
    },
    '& .MuiSvgIcon-root': {
      color: isDark ? '#94a3b8 !important' : '#64748b !important',
    },
    '& input[type="date"]::-webkit-calendar-picker-indicator': {
      filter: isDark ? 'invert(1)' : 'none',
      cursor: 'pointer',
    },
  };
};
