import { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Stack, InputAdornment, Chip, Autocomplete, Collapse,
  IconButton, Tooltip, Typography, useTheme, useMediaQuery, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import partyService from '../../services/partyService';
import DateFilter from '../common/DateFilter';

/**
 * Format local date YYYY-MM-DD
 */
const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Quick date presets
 */
const getQuickDateRange = (preset) => {
  const today = new Date();
  switch (preset) {
    case 'today':
      return { from: formatDateStr(today), to: formatDateStr(today) };
    case 'yesterday': {
      const yest = new Date(today);
      yest.setDate(today.getDate() - 1);
      return { from: formatDateStr(yest), to: formatDateStr(yest) };
    }
    case 'this_week': {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diff = (day === 0 ? -6 : 1) - day; // Monday as start
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      return { from: formatDateStr(startOfWeek), to: formatDateStr(today) };
    }
    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: formatDateStr(startOfMonth), to: formatDateStr(today) };
    }
    case 'this_year': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { from: formatDateStr(startOfYear), to: formatDateStr(today) };
    }
    default:
      return { from: '', to: '' };
  }
};

/**
 * SalesFilters — Filter toolbar with quick date chips, customer autocomplete,
 * payment & sale status filters, and responsive mobile collapse.
 */
const SalesFilters = ({
  search,
  partyId,
  paymentStatus,
  status,
  fromDate,
  toDate,
  onSearchChange,
  onPartyChange,
  onPaymentStatusChange,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
  onReset,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Customer options for dropdown
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await partyService.getParties({ size: 150, type: 'CUSTOMER', status: 'ACTIVE' });
        if (res?.success && res.data?.content) {
          setCustomers(res.data.content);
        }
      } catch {
        // Handled silently
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const handlePresetClick = (preset) => {
    if (activePreset === preset) {
      setActivePreset(null);
      onFromDateChange('');
      onToDateChange('');
    } else {
      setActivePreset(preset);
      const { from, to } = getQuickDateRange(preset);
      onFromDateChange(from);
      onToDateChange(to);
    }
  };

  const handleCustomDateChange = (type, val) => {
    setActivePreset('custom');
    if (type === 'from') onFromDateChange(val);
    if (type === 'to') onToDateChange(val);
  };

  const handleResetAll = () => {
    setActivePreset(null);
    onReset();
  };

  // Count active filters
  let activeCount = 0;
  if (search) activeCount++;
  if (partyId && partyId !== 'ALL') activeCount++;
  if (paymentStatus && paymentStatus !== 'ALL') activeCount++;
  if (status && status !== 'ALL') activeCount++;
  if (fromDate || toDate) activeCount++;

  const selectedCustomer = customers.find((c) => String(c.id) === String(partyId)) || null;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
      {/* Primary Row: Search, Mobile Toggle, Reset */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: isMobile && !mobileExpanded ? 0 : 2 }}>
        <TextField
          size="small"
          placeholder="Search invoice #, customer name, code, phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: { xs: 200, sm: 280 } }}
        />

        {isMobile && (
          <Button
            size="small"
            variant={mobileExpanded || activeCount > 0 ? 'contained' : 'outlined'}
            color={activeCount > 0 ? 'primary' : 'inherit'}
            startIcon={<FilterListIcon />}
            endIcon={mobileExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setMobileExpanded(!mobileExpanded)}
            sx={{ flexShrink: 0 }}
          >
            Filters {activeCount > 0 && `(${activeCount})`}
          </Button>
        )}

        {(!isMobile || mobileExpanded) && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<FilterListOffIcon />}
            onClick={handleResetAll}
            disabled={activeCount === 0}
            sx={{ flexShrink: 0, height: 40 }}
          >
            Reset
          </Button>
        )}
      </Stack>

      {/* Collapsible Section for Filters */}
      <Collapse in={!isMobile || mobileExpanded}>
        {/* Quick Date Presets */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 14 }} /> QUICK DATES:
          </Typography>
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'this_year', label: 'This Year' },
          ].map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              size="small"
              clickable
              color={activePreset === preset.id ? 'primary' : 'default'}
              variant={activePreset === preset.id ? 'filled' : 'outlined'}
              onClick={() => handlePresetClick(preset.id)}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Detailed Filter Grid */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
          {/* Customer Dropdown */}
          <Autocomplete
            size="small"
            options={customers}
            getOptionLabel={(option) => option.partyName ? `${option.partyName} (${option.partyCode || option.mobile || ''})` : ''}
            value={selectedCustomer}
            loading={loadingCustomers}
            onChange={(event, newValue) => {
              onPartyChange(newValue ? newValue.id : '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer"
                placeholder="All Customers"
              />
            )}
            sx={{ minWidth: { xs: '100%', sm: 240 }, flex: { sm: 1.2 } }}
          />

          {/* Custom Date Range */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: { xs: '100%', sm: 150 } }}>
            <DateFilter
              fromDate={fromDate}
              toDate={toDate}
              onChange={(range) => {
                handleCustomDateChange('from', range.fromDate);
                handleCustomDateChange('to', range.toDate);
              }}
            />
          </Box>

          {/* Payment Status */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={paymentStatus}
              label="Payment Status"
              onChange={(e) => onPaymentStatusChange(e.target.value)}
            >
              <MenuItem value="ALL">All Payments</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="PARTIAL">Partial</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>

          {/* Sale Status */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
            <InputLabel>Sale Status</InputLabel>
            <Select
              value={status}
              label="Sale Status"
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default SalesFilters;
