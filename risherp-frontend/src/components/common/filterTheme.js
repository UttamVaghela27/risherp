/**
 * Centralized Filter Theme & Constants for RISHERP
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
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
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
  }

  return { from, to };
};

export const getStandardControlSx = (theme) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    borderRadius: 1,
    bgcolor: 'background.paper',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: 'divider',
    },
    '&:hover fieldset': {
      borderColor: 'primary.light',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    '&.Mui-focused': {
      color: 'primary.main',
    },
  },
  '& input[type="date"]::-webkit-calendar-picker-indicator': {
    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
    cursor: 'pointer',
  },
});
