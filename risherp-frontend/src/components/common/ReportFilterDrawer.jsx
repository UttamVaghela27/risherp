import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
  MenuItem,
  Badge,
  Chip,
  Grid,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import {
  FILTER_DRAWER_SX,
  QUICK_DATE_PRESETS,
  calculatePresetRange,
  getStandardControlSx,
} from './filterTheme';

/**
 * Standard ReportFilterDrawer
 * The ONE standardized, responsive filter drawer for RISHERP.
 * Perfectly calibrated for both Dark Mode and Light Mode with uniform 580px width.
 */
const ReportFilterDrawer = ({
  // Toolbar Props
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  resultCount,
  totalCount,
  itemName = 'Records',

  // Drawer Control Props
  open: controlledOpen,
  onOpen: onControlledOpen,
  onClose: onControlledClose,
  onApply,
  onReset,
  isFiltered: externalIsFiltered,

  // Declarative Filter Configuration Array
  filters = [],

  // Legacy Filter State / Type (for Items, Party, Stock)
  filterType,
  filterState = {},
  onFilterChange,
  filterOptions = {},
  defaultFilterState = {},

  // Built-in Date Filter Props
  showDateFilter = false,
  datePreset = 'ALL',
  onPresetChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,

  // Built-in Entity Selectors
  showParty = false,
  partyLabel = 'Party',
  partyId = '',
  onPartyChange,
  parties = [],

  showCategory = false,
  categoryId = '',
  onCategoryChange,
  categories = [],

  showItem = false,
  itemId = '',
  onItemChange,
  items = [],

  showPaymentStatus = false,
  paymentStatus = '',
  onPaymentStatusChange,

  showStatus = false,
  status = '',
  onStatusChange,
  statusOptions = [],
  statusLabel = 'Status',

  showPaymentMode = false,
  paymentMode = '',
  onPaymentModeChange,

  children,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Internal open state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenDrawer = () => {
    if (isControlled) {
      if (onControlledOpen) onControlledOpen();
    } else {
      setInternalOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    if (isControlled) {
      if (onControlledClose) onControlledClose();
    } else {
      setInternalOpen(false);
    }
  };

  // Draft states to stage filter values before clicking Apply
  const [draftState, setDraftState] = useState({});
  const [draftDatePreset, setDraftDatePreset] = useState(datePreset || 'ALL');
  const [draftDateFrom, setDraftDateFrom] = useState(dateFrom || '');
  const [draftDateTo, setDraftDateTo] = useState(dateTo || '');

  // Synchronize draft states whenever the drawer opens or external props change
  useEffect(() => {
    if (isOpen) {
      setDraftState({
        partyId: partyId || '',
        categoryId: categoryId || '',
        itemId: itemId || '',
        paymentStatus: paymentStatus || '',
        status: status || '',
        paymentMode: paymentMode || '',
        ...(filterState || {}),
      });
      setDraftDatePreset(datePreset || 'ALL');
      setDraftDateFrom(dateFrom || '');
      setDraftDateTo(dateTo || '');
    }
  }, [
    isOpen,
    partyId,
    categoryId,
    itemId,
    paymentStatus,
    status,
    paymentMode,
    datePreset,
    dateFrom,
    dateTo,
    filterState,
  ]);

  const updateDraft = (key, val) => {
    setDraftState((prev) => ({ ...prev, [key]: val }));
  };

  // Preset Date Selection Handler
  const handlePresetSelect = (presetVal) => {
    setDraftDatePreset(presetVal);
    const { from, to } = calculatePresetRange(presetVal);
    setDraftDateFrom(from);
    setDraftDateTo(to);
  };

  // Custom Date From/To Handlers
  const handleDateFromInput = (val) => {
    setDraftDateFrom(val);
    setDraftDatePreset('CUSTOM');
    if (draftDateTo && val && draftDateTo < val) {
      setDraftDateTo(val);
    }
  };

  const handleDateToInput = (val) => {
    setDraftDateTo(val);
    setDraftDatePreset('CUSTOM');
  };

  // Apply Handler
  const handleApplyClick = () => {
    // 1. Commit date changes
    if (onDateFromChange && draftDateFrom !== dateFrom) {
      onDateFromChange(draftDateFrom);
    }
    if (onDateToChange && draftDateTo !== dateTo) {
      onDateToChange(draftDateTo);
    }
    if (onPresetChange && (draftDatePreset !== datePreset || draftDateFrom !== dateFrom || draftDateTo !== dateTo)) {
      onPresetChange(draftDatePreset, draftDateFrom, draftDateTo);
    }

    // 2. Commit entity changes
    if (showParty && onPartyChange && draftState.partyId !== partyId) {
      onPartyChange(draftState.partyId);
    }
    if (showCategory && onCategoryChange && draftState.categoryId !== categoryId) {
      onCategoryChange(draftState.categoryId);
    }
    if (showItem && onItemChange && draftState.itemId !== itemId) {
      onItemChange(draftState.itemId);
    }
    if (showPaymentStatus && onPaymentStatusChange && draftState.paymentStatus !== paymentStatus) {
      onPaymentStatusChange(draftState.paymentStatus);
    }
    if (showStatus && onStatusChange && draftState.status !== status) {
      onStatusChange(draftState.status);
    }
    if (showPaymentMode && onPaymentModeChange && draftState.paymentMode !== paymentMode) {
      onPaymentModeChange(draftState.paymentMode);
    }

    // 3. Commit legacy filterState changes (Items, Party, Stock)
    if (onFilterChange && filterState) {
      Object.keys(draftState).forEach((key) => {
        if (draftState[key] !== filterState[key]) {
          onFilterChange(key, draftState[key]);
        }
      });
    }

    // 4. Custom declarative filters apply
    if (Array.isArray(filters) && filters.length > 0) {
      filters.forEach((f) => {
        if (f.onChange && draftState[f.id] !== undefined && draftState[f.id] !== f.value) {
          f.onChange(draftState[f.id]);
        }
      });
    }

    if (onApply) {
      onApply({
        ...draftState,
        datePreset: draftDatePreset,
        dateFrom: draftDateFrom,
        dateTo: draftDateTo,
      });
    }

    handleCloseDrawer();
  };

  // Complete Clear All Handler (clears dates, entity filters, and triggers onReset)
  const handleClearAll = () => {
    setDraftState({});
    setDraftDatePreset('ALL');
    setDraftDateFrom('');
    setDraftDateTo('');

    if (onDateFromChange) onDateFromChange('');
    if (onDateToChange) onDateToChange('');
    if (onPresetChange) onPresetChange('ALL', '', '');

    if (showParty && onPartyChange) onPartyChange('');
    if (showCategory && onCategoryChange) onCategoryChange(filterType === 'item' ? 'ALL' : '');
    if (showItem && onItemChange) onItemChange('');
    if (showPaymentStatus && onPaymentStatusChange) onPaymentStatusChange(filterType ? 'ALL' : '');
    if (showStatus && onStatusChange) onStatusChange(filterType ? 'ALL' : '');
    if (showPaymentMode && onPaymentModeChange) onPaymentModeChange('');

    if (onReset) {
      onReset();
    }
  };

  // Clear / Reset Handler inside drawer
  const handleClearClick = () => {
    handleClearAll();
    handleCloseDrawer();
  };

  // Normalize list data
  const normalizeList = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (Array.isArray(input.content)) return input.content;
    if (Array.isArray(input.data)) return input.data;
    if (input.data && Array.isArray(input.data.content)) return input.data.content;
    return [];
  };

  const safeParties = normalizeList(parties);
  const safeCategories = normalizeList(categories || filterOptions?.categories);
  const safeItems = normalizeList(items);
  const safeStatusOptions = Array.isArray(statusOptions) ? statusOptions : [];

  // Determine if filters are currently active
  const isDefault = (key, val) => {
    const defaultVal = defaultFilterState[key] !== undefined ? defaultFilterState[key] : 'ALL';
    return !val || val === defaultVal || val === '';
  };

  const isFiltered = useMemo(() => {
    if (externalIsFiltered !== undefined) return Boolean(externalIsFiltered);
    return Boolean(
      (dateFrom && dateTo) ||
      (datePreset && datePreset !== 'ALL') ||
      partyId ||
      categoryId ||
      itemId ||
      paymentStatus ||
      (status && status !== 'ALL') ||
      paymentMode ||
      (search && search.trim() !== '') ||
      Object.keys(filterState).some((k) => !isDefault(k, filterState[k]))
    );
  }, [
    externalIsFiltered,
    dateFrom,
    dateTo,
    datePreset,
    partyId,
    categoryId,
    itemId,
    paymentStatus,
    status,
    paymentMode,
    search,
    filterState,
  ]);

  // Compute active filters tags for top toolbar
  const activeFilters = useMemo(() => {
    const active = [];
    if (dateFrom && dateTo) {
      active.push({
        key: 'date',
        label: `Date: ${dateFrom} to ${dateTo}`,
        clear: () => {
          if (onDateFromChange) onDateFromChange('');
          if (onDateToChange) onDateToChange('');
          if (onPresetChange) onPresetChange('ALL', '', '');
        },
      });
    } else if (datePreset && datePreset !== 'ALL') {
      const p = QUICK_DATE_PRESETS.find((x) => x.value === datePreset);
      if (p) {
        active.push({
          key: 'preset',
          label: `Date: ${p.label}`,
          clear: () => {
            if (onPresetChange) onPresetChange('ALL', '', '');
            if (onDateFromChange) onDateFromChange('');
            if (onDateToChange) onDateToChange('');
          },
        });
      }
    }
    if (partyId && showParty) {
      const p = safeParties.find((x) => String(x.id) === String(partyId));
      active.push({
        key: 'party',
        label: `${partyLabel}: ${p?.partyName || p?.name || partyId}`,
        clear: () => onPartyChange && onPartyChange(''),
      });
    }
    if (categoryId && (showCategory || filterType === 'item')) {
      const c = safeCategories.find((x) => String(x.id) === String(categoryId));
      active.push({
        key: 'category',
        label: `Category: ${c?.categoryName || c?.name || categoryId}`,
        clear: () => {
          if (onCategoryChange) onCategoryChange(filterType === 'item' ? 'ALL' : '');
          if (onFilterChange) onFilterChange('categoryId', 'ALL');
        },
      });
    }
    if (itemId && showItem) {
      const i = safeItems.find((x) => String(x.id) === String(itemId));
      active.push({
        key: 'item',
        label: `Item: ${i?.itemName || i?.name || itemId}`,
        clear: () => onItemChange && onItemChange(''),
      });
    }
    if (paymentStatus && (showPaymentStatus || filterType === 'sales' || filterType === 'purchase')) {
      active.push({
        key: 'paymentStatus',
        label: `Payment: ${paymentStatus}`,
        clear: () => {
          if (onPaymentStatusChange) onPaymentStatusChange(filterType ? 'ALL' : '');
          if (onFilterChange) onFilterChange('paymentStatus', 'ALL');
        },
      });
    }
    if (status && status !== 'ALL' && (showStatus || filterType)) {
      const opt = safeStatusOptions.find((x) => x.value === status);
      active.push({
        key: 'status',
        label: `${statusLabel}: ${opt?.label || status}`,
        clear: () => {
          if (onStatusChange) onStatusChange(filterType ? 'ALL' : '');
          if (onFilterChange) onFilterChange('status', 'ALL');
        },
      });
    }
    if (paymentMode && showPaymentMode) {
      active.push({
        key: 'paymentMode',
        label: `Mode: ${paymentMode}`,
        clear: () => onPaymentModeChange && onPaymentModeChange(''),
      });
    }
    if (filterType === 'party') {
      if (filterState.partyType && filterState.partyType !== 'ALL') {
        active.push({
          key: 'partyType',
          label: `Type: ${filterState.partyType}`,
          clear: () => onFilterChange && onFilterChange('partyType', 'ALL'),
        });
      }
    }
    if (filterType === 'item') {
      if (filterState.stockStatus && filterState.stockStatus !== 'ALL') {
        active.push({
          key: 'stockStatus',
          label: `Stock: ${filterState.stockStatus.replace('_', ' ')}`,
          clear: () => onFilterChange && onFilterChange('stockStatus', 'ALL'),
        });
      }
    }
    return active;
  }, [
    dateFrom,
    dateTo,
    datePreset,
    partyId,
    showParty,
    partyLabel,
    safeParties,
    categoryId,
    showCategory,
    safeCategories,
    itemId,
    showItem,
    safeItems,
    paymentStatus,
    showPaymentStatus,
    status,
    showStatus,
    statusLabel,
    safeStatusOptions,
    paymentMode,
    showPaymentMode,
    filterType,
    filterState,
    onDateFromChange,
    onDateToChange,
    onPresetChange,
    onPartyChange,
    onCategoryChange,
    onItemChange,
    onPaymentStatusChange,
    onStatusChange,
    onPaymentModeChange,
    onFilterChange,
  ]);

  const filterCount = activeFilters.length;

  // Format date range preview badge
  const datePreviewBadge = useMemo(() => {
    if (draftDateFrom && draftDateTo) {
      return draftDateFrom === draftDateTo ? draftDateFrom : `${draftDateFrom} to ${draftDateTo}`;
    }
    if (draftDatePreset && draftDatePreset !== 'ALL') {
      const p = QUICK_DATE_PRESETS.find((x) => x.value === draftDatePreset);
      return p ? p.label : draftDatePreset;
    }
    return 'All Dates';
  }, [draftDateFrom, draftDateTo, draftDatePreset]);

  return (
    <>
      {/* Top Search & Filter Bar (shown if search or resultCount is provided) */}
      {(onSearchChange !== undefined || resultCount !== undefined) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: activeFilters.length > 0 ? 1.5 : 2.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Result Count Display */}
          {resultCount !== undefined ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {totalCount && totalCount > resultCount
                ? `Showing ${resultCount} of ${totalCount} ${itemName}`
                : `Showing ${resultCount} ${itemName}`}
            </Typography>
          ) : (
            <Box sx={{ flexGrow: 1 }} />
          )}

          {/* Search Input & Filter Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onSearchChange !== undefined && (
              <TextField
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 300 },
                  bgcolor: isDark ? '#1e293b' : '#ffffff',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    borderRadius: 2,
                    bgcolor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    '& fieldset': {
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? '#60a5fa' : '#3b82f6',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <Button
              variant="outlined"
              startIcon={
                <Badge
                  badgeContent={filterCount}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { right: -3, top: -3 } }}
                >
                  <FilterAltOutlinedIcon />
                </Badge>
              }
              onClick={handleOpenDrawer}
              sx={{
                height: '40px',
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                color: isFiltered ? 'primary.main' : (isDark ? '#f8fafc' : '#0f172a'),
                borderColor: isFiltered ? 'primary.main' : (isDark ? '#334155' : '#cbd5e1'),
                bgcolor: isFiltered
                  ? (isDark ? 'rgba(59, 130, 246, 0.15)' : alpha(theme.palette.primary.main, 0.08))
                  : (isDark ? '#1e293b' : '#ffffff'),
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.25)' : alpha(theme.palette.primary.main, 0.14),
                },
              }}
            >
              Filter {filterCount > 0 && `(${filterCount})`}
            </Button>
          </Box>
        </Box>
      )}

      {/* Active Filter Chips Toolbar */}
      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontWeight: 600 }}>
            Active Filters:
          </Typography>
          {activeFilters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              onDelete={f.clear}
              size="small"
              sx={{
                borderRadius: 1.5,
                fontWeight: 600,
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
                color: isDark ? '#93c5fd' : '#1d4ed8',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.2)'}`,
                '& .MuiChip-deleteIcon': {
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                  '&:hover': {
                    color: '#ef4444',
                  },
                },
              }}
            />
          ))}
          <Button
            size="small"
            color="error"
            onClick={handleClearAll}
            sx={{
              textTransform: 'none',
              ml: 1,
              py: 0.2,
              px: 1,
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: isDark ? '#f87171' : '#dc2626',
              bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              borderRadius: '6px',
              border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
              '&:hover': {
                bgcolor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
              },
            }}
          >
            Clear All
          </Button>
        </Box>
      )}

      {/* The Centralized Filter Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleCloseDrawer}
        ModalProps={{
          disableEnforceFocus: true,
          disableAutoFocus: true,
        }}
        PaperProps={{
          sx: {
            ...FILTER_DRAWER_SX,
            bgcolor: isDark ? '#1e293b !important' : '#ffffff !important',
            color: isDark ? '#f8fafc !important' : '#0f172a !important',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            boxShadow: isDark
              ? '-8px 0 32px rgba(0, 0, 0, 0.7)'
              : '-8px 0 32px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        {/* Standard Drawer Header */}
        <Box
          sx={{
            height: '64px',
            px: 3,
            py: 2,
            borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                color: isDark ? '#60a5fa' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ letterSpacing: '-0.01em', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '1.125rem' }}
            >
              Filters
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDrawer}
            size="small"
            sx={{
              color: isDark ? '#94a3b8' : '#64748b',
              borderRadius: '8px',
              p: 1,
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? '#f8fafc' : '#0f172a',
              },
            }}
          >
            <CloseOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Scrollable Filter Content */}
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            flex: 1,
            overflowY: 'auto',
            bgcolor: isDark ? '#0f172a' : '#f8fafc',
          }}
        >
          {/* 1. Standard Date Range Filter Section */}
          {(showDateFilter || onPresetChange || onDateFromChange || onDateToChange) && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Date Header with Range Badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                  Date Range
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: '6px',
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
                    color: isDark ? '#93c5fd' : '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                  }}
                >
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />
                  <span>{datePreviewBadge}</span>
                </Box>
              </Box>

              {/* Date Presets Grid */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {QUICK_DATE_PRESETS.map((preset) => {
                  const isSelected = draftDatePreset === preset.value;
                  return (
                    <Button
                      key={preset.value}
                      size="small"
                      onClick={() => handlePresetSelect(preset.value)}
                      variant={isSelected ? 'contained' : 'outlined'}
                      sx={{
                        height: '34px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 700 : 500,
                        px: 1.75,
                        borderColor: isSelected
                          ? '#3b82f6 !important'
                          : isDark
                          ? '#334155 !important'
                          : '#cbd5e1 !important',
                        bgcolor: isSelected
                          ? '#3b82f6 !important'
                          : isDark
                          ? '#0f172a !important'
                          : '#ffffff !important',
                        color: isSelected
                          ? '#ffffff !important'
                          : isDark
                          ? '#cbd5e1 !important'
                          : '#334155 !important',
                        '&:hover': {
                          bgcolor: isSelected
                            ? '#2563eb !important'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.08) !important'
                            : 'rgba(59, 130, 246, 0.05) !important',
                          borderColor: '#3b82f6 !important',
                        },
                      }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </Stack>

              {/* Custom Date Range Inputs */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="From Date"
                    value={draftDateFrom || ''}
                    onChange={(e) => handleDateFromInput(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={getStandardControlSx(theme)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="To Date"
                    value={draftDateTo || ''}
                    onChange={(e) => handleDateToInput(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: draftDateFrom || undefined }}
                    sx={getStandardControlSx(theme)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* 2. Standard Entity Dropdowns */}
          {/* Party (Customer / Supplier) */}
          {showParty && (
            <TextField
              select
              fullWidth
              size="small"
              label={partyLabel}
              value={draftState.partyId || ''}
              onChange={(e) => updateDraft('partyId', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value="">All {partyLabel}s</MenuItem>
              {safeParties.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.partyName || p.name || `Party #${p.id}`}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Category */}
          {(showCategory || filterType === 'item') && (
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={draftState.categoryId || (filterType === 'item' ? 'ALL' : '')}
              onChange={(e) => updateDraft('categoryId', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value={filterType === 'item' ? 'ALL' : ''}>All Categories</MenuItem>
              {safeCategories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.categoryName || c.name || `Category #${c.id}`}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Item / Product */}
          {showItem && (
            <TextField
              select
              fullWidth
              size="small"
              label="Item"
              value={draftState.itemId || ''}
              onChange={(e) => updateDraft('itemId', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value="">All Items</MenuItem>
              {safeItems.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  {i.itemName || i.name} {i.itemCode ? `(${i.itemCode})` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Stock Level (for Inventory/Stock modules) */}
          {filterType === 'item' && (
            <TextField
              select
              fullWidth
              size="small"
              label="Stock Level"
              value={draftState.stockStatus || 'ALL'}
              onChange={(e) => updateDraft('stockStatus', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value="ALL">All Stock Levels</MenuItem>
              <MenuItem value="IN_STOCK">In Stock</MenuItem>
              <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
              <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
            </TextField>
          )}

          {/* Party Type (for Party module) */}
          {filterType === 'party' && (
            <TextField
              select
              fullWidth
              size="small"
              label="Party Type"
              value={draftState.partyType || 'ALL'}
              onChange={(e) => updateDraft('partyType', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="CUSTOMER">Customer</MenuItem>
              <MenuItem value="SUPPLIER">Supplier</MenuItem>
            </TextField>
          )}

          {/* Payment Status */}
          {(showPaymentStatus || filterType === 'sales' || filterType === 'purchase') && (
            <TextField
              select
              fullWidth
              size="small"
              label="Payment Status"
              value={draftState.paymentStatus || (filterType ? 'ALL' : '')}
              onChange={(e) => updateDraft('paymentStatus', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value={filterType ? 'ALL' : ''}>All Payment Statuses</MenuItem>
              <MenuItem value="PAID">PAID</MenuItem>
              <MenuItem value="PARTIAL">PARTIAL</MenuItem>
              <MenuItem value="UNPAID">UNPAID</MenuItem>
            </TextField>
          )}

          {/* Status Dropdown */}
          {(showStatus || filterType) && (
            <TextField
              select
              fullWidth
              size="small"
              label={statusLabel}
              value={draftState.status || (filterType ? 'ALL' : '')}
              onChange={(e) => updateDraft('status', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value={filterType ? 'ALL' : ''}>
                {filterType ? 'All Status' : 'Active (Exclude Cancelled)'}
              </MenuItem>
              {safeStatusOptions.length > 0 ? (
                safeStatusOptions.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))
              ) : filterType === 'item' || filterType === 'party' ? (
                <>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </>
              ) : filterType === 'sales' ? (
                <>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </>
              ) : filterType === 'purchase' ? (
                <>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="RECEIVED">Received</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </>
              ) : null}
            </TextField>
          )}

          {/* Payment Mode */}
          {showPaymentMode && (
            <TextField
              select
              fullWidth
              size="small"
              label="Payment Mode"
              value={draftState.paymentMode || ''}
              onChange={(e) => updateDraft('paymentMode', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={getStandardControlSx(theme)}
            >
              <MenuItem value="">All Modes</MenuItem>
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="CHEQUE">Cheque</MenuItem>
              <MenuItem value="CARD">Card</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
          )}

          {/* 3. Declarative Filters (if passed via `filters` prop) */}
          {Array.isArray(filters) &&
            filters.map((f) => {
              if (f.type === 'custom' && f.render) {
                return <Box key={f.id}>{f.render({ value: draftState[f.id], onChange: (v) => updateDraft(f.id, v) })}</Box>;
              }
              if (f.type === 'select') {
                return (
                  <TextField
                    key={f.id}
                    select
                    fullWidth
                    size="small"
                    label={f.label}
                    value={draftState[f.id] !== undefined ? draftState[f.id] : f.value || ''}
                    onChange={(e) => updateDraft(f.id, e.target.value)}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            bgcolor: isDark ? '#1e293b' : '#ffffff',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          },
                        },
                      },
                    }}
                    InputLabelProps={{ shrink: true }}
                    sx={getStandardControlSx(theme)}
                  >
                    <MenuItem value="">{f.allLabel || `All ${f.label}s`}</MenuItem>
                    {(f.options || []).map((opt) => (
                      <MenuItem key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }
              if (f.type === 'text') {
                return (
                  <TextField
                    key={f.id}
                    fullWidth
                    size="small"
                    label={f.label}
                    placeholder={f.placeholder}
                    value={draftState[f.id] !== undefined ? draftState[f.id] : f.value || ''}
                    onChange={(e) => updateDraft(f.id, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={getStandardControlSx(theme)}
                  />
                );
              }
              return null;
            })}

          {/* 4. Custom Children Support */}
          {children}
        </Box>

        {/* Standard Fixed Footer */}
        <Box
          sx={{
            height: '72px',
            px: 3,
            py: 2,
            borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={handleClearClick}
            sx={{
              flex: 1,
              height: '42px',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5',
              bgcolor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
              color: isDark ? '#f87171' : '#dc2626',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.06)',
              },
            }}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterAltOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={handleApplyClick}
            sx={{
              flex: 1,
              height: '42px',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: 'none',
              bgcolor: '#3b82f6',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#2563eb',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default ReportFilterDrawer;
