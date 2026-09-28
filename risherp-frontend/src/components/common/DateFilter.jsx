import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { getStandardControlSx } from './filterTheme';

/**
 * DateFilter
 * Standard standalone date range button & modal dialog.
 * Standardized with consistent 40px height, 8px radius, and direct dark/light palette support.
 */
const DateFilter = ({ fromDate, toDate, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [open, setOpen] = useState(false);

  const [localFrom, setLocalFrom] = useState(fromDate || '');
  const [localTo, setLocalTo] = useState(toDate || '');

  const handleOpen = () => {
    setLocalFrom(fromDate || '');
    setLocalTo(toDate || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleApply = () => {
    if (localFrom && localTo) {
      onChange({ fromDate: localFrom, toDate: localTo, label: 'Custom' });
      handleClose();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  let displayLabel = 'Select Date';
  if (fromDate && toDate) {
    if (fromDate === toDate) displayLabel = fromDate;
    else displayLabel = `${fromDate} to ${toDate}`;
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarMonthOutlinedIcon fontSize="small" sx={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />}
        onClick={handleOpen}
        sx={{
          height: '40px',
          px: 2,
          borderRadius: '8px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: isDark ? '#f8fafc' : '#0f172a',
          borderColor: isDark ? '#334155' : '#cbd5e1',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(59, 130, 246, 0.05)',
            borderColor: '#3b82f6',
          },
        }}
      >
        {displayLabel}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: isDark ? '#1e293b !important' : '#ffffff !important',
            color: isDark ? '#f8fafc !important' : '#0f172a !important',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.7)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, fontWeight: 700, fontSize: '1.125rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
          Select Date Range
        </DialogTitle>
        <DialogContent sx={{ pb: 2, px: 3, bgcolor: isDark ? '#1e293b' : '#ffffff' }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Start Date"
              type="date"
              value={localFrom}
              onChange={(e) => {
                const val = e.target.value;
                setLocalFrom(val);
                if (localTo && val && localTo < val) {
                  setLocalTo('');
                }
              }}
              inputProps={{ max: todayStr }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={getStandardControlSx(theme)}
            />
            <TextField
              label="End Date"
              type="date"
              value={localTo}
              onChange={(e) => setLocalTo(e.target.value)}
              inputProps={{ min: localFrom, max: todayStr }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={getStandardControlSx(theme)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', gap: 1.5, bgcolor: isDark ? '#1e293b' : '#ffffff' }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              flex: 1,
              height: '40px',
              color: isDark ? '#cbd5e1' : '#64748b',
              borderColor: isDark ? '#334155' : '#cbd5e1',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark ? '#94a3b8' : '#94a3b8',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            disabled={!localFrom || !localTo}
            sx={{
              flex: 1,
              height: '40px',
              textTransform: 'none',
              boxShadow: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              bgcolor: '#3b82f6',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#2563eb',
              },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DateFilter;
