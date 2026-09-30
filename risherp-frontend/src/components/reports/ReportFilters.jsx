import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterBar from '../common/FilterBar';
import DateFilter from '../common/DateFilter';
import { QUICK_DATE_PRESETS, calculatePresetRange } from '../common/filterTheme';

/**
 * ReportFilters — Standardized filter bar for all ERP reports.
 * Uses the common FilterBar container with inline search, quick date presets,
 * custom date dialog, and contextual dropdown selectors.
 */
const ReportFilters = ({
  datePreset = 'ALL',
  onPresetChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search in reports...',
  partyId = '',
  onPartyChange,
  parties = [],
  partyLabel = 'Party',
  showParty = false,
  itemId = '',
  onItemChange,
  items = [],
  showItem = false,
  categoryId = '',
  onCategoryChange,
  categories = [],
  showCategory = false,
  paymentStatus = '',
  onPaymentStatusChange,
  showPaymentStatus = false,
  status = '',
  onStatusChange,
  statusOptions = [],
  showStatus = false,
  statusLabel = 'Status',
  paymentMode = '',
  onPaymentModeChange,
  showPaymentMode = false,
  onReset,
  children,
}) => {
  // Safe Array normalizers to prevent TypeError if API returns an object or pagination payload
  const safeParties = Array.isArray(parties)
    ? parties
    : (parties?.data?.content || parties?.content || parties?.data || []);

  const safeCategories = Array.isArray(categories)
    ? categories
    : (categories?.data?.content || categories?.content || categories?.data || []);

  const safeItems = Array.isArray(items)
    ? items
    : (items?.data?.content || items?.content || items?.data || []);

  const safeStatusOptions = Array.isArray(statusOptions) ? statusOptions : [];

  const isFiltered = Boolean(
    (search && search.trim() !== '') ||
    (partyId && partyId !== '' && partyId !== 'ALL') ||
    (categoryId && categoryId !== '' && categoryId !== 'ALL') ||
    (itemId && itemId !== '' && itemId !== 'ALL') ||
    (paymentStatus && paymentStatus !== '' && paymentStatus !== 'ALL') ||
    (status && status !== '' && status !== 'ALL') ||
    (paymentMode && paymentMode !== '' && paymentMode !== 'ALL') ||
    (datePreset && datePreset !== 'ALL' && datePreset !== 'THIS_MONTH') ||
    (dateFrom && dateFrom !== '') ||
    (dateTo && dateTo !== '')
  );

  return (
    <FilterBar isFiltered={isFiltered} onReset={onReset}>
      {/* Search Input */}
      {onSearchChange && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 2, minWidth: { xs: '100%', sm: 220 } }}
        />
      )}

      {/* Quick Date Presets */}
      {onPresetChange && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 14 }} /> Dates:
          </Typography>
          {QUICK_DATE_PRESETS.map((preset) => (
            <Chip
              key={preset.value}
              label={preset.label}
              size="small"
              clickable
              color={datePreset === preset.value ? 'primary' : 'default'}
              variant={datePreset === preset.value ? 'filled' : 'outlined'}
              onClick={() => {
                const range = calculatePresetRange(preset.value);
                onPresetChange(preset.value, range.from, range.to);
              }}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          ))}
        </Box>
      )}

      {/* Custom Date Range Filter */}
      {onDateFromChange && onDateToChange && (
        <DateFilter
          fromDate={dateFrom}
          toDate={dateTo}
          onChange={(range) => {
            if (onPresetChange) {
              onPresetChange('CUSTOM', range.fromDate, range.toDate);
            } else {
              onDateFromChange(range.fromDate);
              onDateToChange(range.toDate);
            }
          }}
        />
      )}

      {/* Party Selector (Customer / Supplier) */}
      {showParty && onPartyChange && (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{partyLabel}</InputLabel>
          <Select
            value={partyId || ''}
            label={partyLabel}
            onChange={(e) => onPartyChange(e.target.value)}
          >
            <MenuItem value="">All {partyLabel}s</MenuItem>
            {safeParties.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.partyName || p.name || p.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Category Selector */}
      {showCategory && onCategoryChange && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId || ''}
            label="Category"
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {safeCategories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.categoryName || c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Item Selector */}
      {showItem && onItemChange && (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Item</InputLabel>
          <Select
            value={itemId || ''}
            label="Item"
            onChange={(e) => onItemChange(e.target.value)}
          >
            <MenuItem value="">All Items</MenuItem>
            {safeItems.map((it) => (
              <MenuItem key={it.id} value={it.id}>
                {it.itemName || it.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Payment Status */}
      {showPaymentStatus && onPaymentStatusChange && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Payment</InputLabel>
          <Select
            value={paymentStatus || ''}
            label="Payment"
            onChange={(e) => onPaymentStatusChange(e.target.value)}
          >
            <MenuItem value="">All Payments</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="PARTIAL">Partial</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Status */}
      {showStatus && onStatusChange && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{statusLabel}</InputLabel>
          <Select
            value={status || ''}
            label={statusLabel}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <MenuItem value="">All {statusLabel}</MenuItem>
            {safeStatusOptions.length > 0
              ? safeStatusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label || opt.value}
                  </MenuItem>
                ))
              : [
                  <MenuItem key="COMPLETED" value="COMPLETED">Completed</MenuItem>,
                  <MenuItem key="CANCELLED" value="CANCELLED">Cancelled</MenuItem>,
                ]}
          </Select>
        </FormControl>
      )}

      {/* Payment Mode */}
      {showPaymentMode && onPaymentModeChange && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Payment Mode</InputLabel>
          <Select
            value={paymentMode || ''}
            label="Payment Mode"
            onChange={(e) => onPaymentModeChange(e.target.value)}
          >
            <MenuItem value="">All Modes</MenuItem>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="CHEQUE">Cheque</MenuItem>
            <MenuItem value="CARD">Card</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Additional Custom Children */}
      {children}
    </FilterBar>
  );
};

export default ReportFilters;
