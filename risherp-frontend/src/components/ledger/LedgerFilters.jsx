import React from 'react';
import {
  Paper,
  Box,
  TextField,
  MenuItem,
  Button,
  ButtonGroup,
  InputAdornment,
  Grid,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DateFilter from '../common/DateFilter';

const transactionTypes = [
  { value: '', label: 'All Transactions' },
  { value: 'OPENING_BALANCE', label: 'Opening Balance' },
  { value: 'SALE', label: 'Sale Invoice' },
  { value: 'RECEIPT', label: 'Customer Receipt' },
  { value: 'SALES_RETURN', label: 'Sales Return' },
  { value: 'PURCHASE', label: 'Purchase Invoice' },
  { value: 'PAYMENT', label: 'Supplier Payment' },
  { value: 'PURCHASE_RETURN', label: 'Purchase Return' },
];

const LedgerFilters = ({
  search,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  txnType,
  onTxnTypeChange,
  onReset,
  onQuickDateFilter,
  activeQuickFilter,
}) => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: 2 }}>
          {['ALL', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR'].map((period) => (
            <Button
              key={period}
              onClick={() => onQuickDateFilter(period)}
              variant={activeQuickFilter === period ? 'contained' : 'outlined'}
              sx={{ textTransform: 'capitalize', px: 1.5, py: 0.5, fontWeight: 600 }}
            >
              {period === 'ALL' ? 'All Time' : period.replace('_', ' ').toLowerCase()}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: '2fr 1.5fr 1.2fr 1.2fr auto',
          },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search Reference # / Remarks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          size="small"
          select
          label="Transaction Type"
          value={txnType}
          onChange={(e) => onTxnTypeChange(e.target.value)}
        >
          {transactionTypes.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: { xs: '100%', sm: 150 } }}>
          <DateFilter
            fromDate={dateFrom}
            toDate={dateTo}
            onChange={(range) => {
              onDateFromChange(range.fromDate);
              onDateToChange(range.toDate);
            }}
          />
        </Box>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          sx={{
            height: 40,
            borderRadius: '10px',
            borderColor: 'divider',
            color: theme.palette.text.secondary,
            px: 2,
            whiteSpace: 'nowrap',
          }}
        >
          Reset
        </Button>
      </Box>
    </Paper>
  );
};

export default LedgerFilters;
