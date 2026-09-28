import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DateFilter from '../common/DateFilter';

const filterOptions = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Last 7D' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

/**
 * Calculates ISO fromDate and toDate strings for each preset
 */
const getDateRange = (rangeId) => {
  const now = new Date();
  const toDateStr = now.toISOString().split('T')[0];

  let fromDate = new Date(now);

  switch (rangeId) {
    case 'yesterday': {
      fromDate.setDate(now.getDate() - 1);
      const yStr = fromDate.toISOString().split('T')[0];
      return { fromDate: yStr, toDate: yStr, label: 'Yesterday' };
    }
    case 'week': {
      fromDate.setDate(now.getDate() - 7);
      return { fromDate: fromDate.toISOString().split('T')[0], toDate: toDateStr, label: 'Last 7 Days' };
    }
    case 'month': {
      fromDate.setDate(1); // 1st day of current month
      return { fromDate: fromDate.toISOString().split('T')[0], toDate: toDateStr, label: 'This Month' };
    }
    case 'year': {
      fromDate.setMonth(0, 1); // Jan 1st of current year
      return { fromDate: fromDate.toISOString().split('T')[0], toDate: toDateStr, label: 'This Year' };
    }
    case 'today':
    default:
      return { fromDate: toDateStr, toDate: toDateStr, label: 'Today' };
  }
};

/**
 * DashboardFilters Component
 * Executive segmented date range controller with clean micro-interactions.
 */
const DashboardFilters = ({ onFilterChange, onRefresh, loading = false }) => {
  const theme = useTheme();
  const [activeRange, setActiveRange] = useState('today');
  const [customRange, setCustomRange] = useState(null);

  const isDark = theme.palette.mode === 'dark';

  const handleSelect = (rangeId) => {
    setActiveRange(rangeId);
    setCustomRange(null);
    const range = getDateRange(rangeId);
    onFilterChange(range);
  };

  const handleCustomDateChange = (range) => {
    setActiveRange('custom');
    setCustomRange(range);
    onFilterChange(range);
  };

  let activeLabel = 'Today';
  if (activeRange === 'custom' && customRange) {
    activeLabel = customRange.label || 'Custom';

    activeLabel = filterOptions.find((o) => o.id === activeRange)?.label || 'Today';
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3.5,
        p: 1.25,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Left: Active date info indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(37,99,235,0.2)' : alpha(theme.palette.info.main, 0.1),
            color: isDark ? '#60a5fa' : theme.palette.info.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography variant="body2" fontWeight={650} color="text.primary">
          Analytics Timeline:
        </Typography>
        <Box
          sx={{
            px: 1.2,
            py: 0.3,
            borderRadius: '9999px',
            bgcolor: isDark ? 'rgba(37,99,235,0.1)' : theme.palette.background.default,
            border: `1px solid ${isDark ? 'rgba(37,99,235,0.3)' : theme.palette.divider}`,
            color: isDark ? '#93c5fd' : theme.palette.info.main,
            fontWeight: 750,
            fontSize: '0.75rem',
          }}
        >
          {activeLabel}
        </Box>
      </Box>

      {/* Right: Modern Segmented Switch + Custom Date + Refresh */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Box
          sx={{
            display: 'flex',
            p: 0.5,
            bgcolor: isDark ? 'rgba(0,0,0,0.2)' : theme.palette.background.default,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            gap: 0.5,
            flex: { xs: 1, sm: 'none' },
            overflowX: 'auto',
          }}
        >
          {filterOptions.map((opt) => {
            const isSelected = activeRange === opt.id;
            return (
              <Button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                size="small"
                sx={{
                  py: 0.45,
                  px: 1.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 750 : 550,
                  bgcolor: isSelected ? `${theme.palette.background.paper} !important` : 'transparent',
                  color: isSelected ? 'text.primary !important' : 'text.secondary',
                  boxShadow: isSelected ? (isDark ? '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)') : 'none',
                  border: isSelected ? `1px solid ${theme.palette.divider}` : '1px solid transparent',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: isSelected ? theme.palette.background.paper : theme.palette.action.hover,
                  },
                }}
              >
                {opt.label}
              </Button>
            );
          })}
        </Box>

        <DateFilter 
          fromDate={customRange?.fromDate || getDateRange('today').fromDate} 
          toDate={customRange?.toDate || getDateRange('today').toDate} 
          onChange={handleCustomDateChange}
        />

        <Tooltip title="Refresh metrics">
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={loading}
            sx={{
              p: 0.85,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              color: 'text.secondary',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: theme.palette.action.hover,
                color: 'primary.main',
                borderColor: isDark ? theme.palette.text.secondary : theme.palette.divider,
                transform: 'scale(1.05)',
              },
            }}
          >
            <RefreshIcon
              sx={{
                fontSize: 18,
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default DashboardFilters;
