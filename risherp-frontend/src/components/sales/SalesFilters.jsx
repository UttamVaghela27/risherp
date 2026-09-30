import { useState, useEffect } from 'react';
import {
  TextField, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, Chip, Autocomplete, Typography, Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import partyService from '../../services/partyService';
import DateFilter from '../common/DateFilter';
import FilterBar from '../common/FilterBar';

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
      const diff = (day === 0 ? -6 : 1) - day;
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
 * SalesFilters — Filter toolbar using FilterBar, with quick date chips,
 * customer autocomplete, payment & sale status filters.
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

  const isFiltered =
    !!(search) ||
    !!(partyId && partyId !== 'ALL') ||
    !!(paymentStatus && paymentStatus !== 'ALL') ||
    !!(status && status !== 'ALL') ||
    !!(fromDate || toDate);

  const selectedCustomer = customers.find((c) => String(c.id) === String(partyId)) || null;

  return (
    <FilterBar isFiltered={isFiltered} onReset={handleResetAll}>
      {/* Search */}
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
        sx={{ flex: 2, minWidth: { xs: '100%', sm: 240 } }}
      />

      {/* Customer Autocomplete */}
      <Autocomplete
        size="small"
        options={customers}
        getOptionLabel={(option) =>
          option.partyName ? `${option.partyName} (${option.partyCode || option.mobile || ''})` : ''
        }
        value={selectedCustomer}
        loading={loadingCustomers}
        onChange={(_, newValue) => onPartyChange(newValue ? newValue.id : '')}
        renderInput={(params) => (
          <TextField {...params} label="Customer" placeholder="All Customers" />
        )}
        sx={{ minWidth: { xs: '100%', sm: 200 } }}
      />

      {/* Quick Date Presets */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
          <CalendarMonthIcon sx={{ fontSize: 14 }} /> Dates:
        </Typography>
        {[
          { id: 'today', label: 'Today' },
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

      {/* Custom Date Range */}
      <DateFilter
        fromDate={fromDate}
        toDate={toDate}
        onChange={(range) => {
          handleCustomDateChange('from', range.fromDate);
          handleCustomDateChange('to', range.toDate);
        }}
      />

      {/* Payment Status */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Payment</InputLabel>
        <Select value={paymentStatus} label="Payment" onChange={(e) => onPaymentStatusChange(e.target.value)}>
          <MenuItem value="ALL">All Payments</MenuItem>
          <MenuItem value="PAID">Paid</MenuItem>
          <MenuItem value="PARTIAL">Partial</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
        </Select>
      </FormControl>

      {/* Sale Status */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Status</InputLabel>
        <Select value={status} label="Status" onChange={(e) => onStatusChange(e.target.value)}>
          <MenuItem value="ALL">All Status</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </Select>
      </FormControl>
    </FilterBar>
  );
};

export default SalesFilters;
