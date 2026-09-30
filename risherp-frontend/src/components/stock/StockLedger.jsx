import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Button,
  Stack,
  InputAdornment,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import EmptyState from '../common/EmptyState';
import { TableSkeleton } from '../common/Loading';
import stockService from '../../services/stockService';

const REFERENCE_TYPES = [
  { value: 'ALL', label: 'All Types' },
  { value: 'SALE', label: 'Sale' },
  { value: 'SALE_CANCEL', label: 'Sale Cancel' },
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'PURCHASE_CANCEL', label: 'Purchase Cancel' },
];

const TxnChip = ({ txnType }) => {
  const theme = useTheme();
  const isIn = txnType === 'IN';
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.3,
        borderRadius: '9999px',
        bgcolor: isIn ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
        color: isIn ? '#065f46' : '#991b1b',
        border: `1px solid ${isIn ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`,
        fontWeight: 750,
        fontSize: '0.7rem',
        letterSpacing: 0.3,
      }}
    >
      {isIn ? (
        <TrendingUpIcon sx={{ fontSize: 13, color: theme.palette.success.main }} />
      ) : (
        <TrendingDownIcon sx={{ fontSize: 13, color: theme.palette.error.main }} />
      )}
      <span>{isIn ? 'IN' : 'OUT'}</span>
    </Box>
  );
};

const RefTypeBadge = ({ refType }) => {
  const theme = useTheme();
  const colorMap = {
    SALE: { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark, border: alpha(theme.palette.info.main, 0.2) },
    SALE_CANCEL: { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
    PURCHASE: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    PURCHASE_CANCEL: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    ADJUSTMENT: { bg: theme.palette.background.default, color: theme.palette.text.secondary, border: theme.palette.divider },
  };
  const style = colorMap[refType] || colorMap.ADJUSTMENT;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.25,
        borderRadius: '9999px',
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 650,
        fontSize: '0.68rem',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
      }}
    >
      {refType?.replace('_', ' ') || '—'}
    </Box>
  );
};

/**
 * StockLedger Component
 * Displays paginated stock transaction history with filters for item, date range, and type.
 * Used as a tab inside the Stock Management page.
 */
const StockLedger = ({ prefilterItemId = null }) => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Filters
  const todayStr = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [referenceType, setReferenceType] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stockService.getStockLedger({
        itemId: prefilterItemId || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
        referenceType: referenceType !== 'ALL' ? referenceType : null,
        page,
        size: rowsPerPage,
      });
      if (res?.success) {
        setTransactions(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  }, [prefilterItemId, fromDate, toDate, referenceType, page, rowsPerPage]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setReferenceType('ALL');
    setSearch('');
    setPage(0);
  };

  // Filter transactions by search locally (item name/code/ref number)
  const filtered = search.trim()
    ? transactions.filter((t) => {
      const q = search.trim().toLowerCase();
      return (
        t.itemName?.toLowerCase().includes(q) ||
        t.itemCode?.toLowerCase().includes(q) ||
        t.referenceNumber?.toLowerCase().includes(q)
      );
    })
    : transactions;

  return (
    <Box>
      {/* Filters Bar */}
      <Card
        sx={{
          p: 2,
          mb: 2.5,
          border: 1, borderColor: 'divider',
          borderRadius: 2,
          background: '#fafbfc',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              size="small"
              fullWidth
              label="Search item / reference"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.5}>
            <TextField
              size="small"
              fullWidth
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.5}>
            <TextField
              size="small"
              fullWidth
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(0); }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField
              select
              size="small"
              fullWidth
              label="Type"
              value={referenceType}
              onChange={(e) => { setReferenceType(e.target.value); setPage(0); }}
            >
              {REFERENCE_TYPES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Reset filters">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RestartAltIcon />}
                  onClick={handleReset}
                  sx={{ borderColor: 'divider', color: 'text.secondary', whiteSpace: 'nowrap' }}
                >
                  Reset
                </Button>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Ledger Table */}
      <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={10} columns={8} />
        ) : (
          <TableContainer sx={{ minHeight: 340 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 120 }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Item Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 110 }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 110 }}>Before</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 110 }}>After</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 160 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 160 }}>Date & Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0 }}>
                      <EmptyState
                        icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 48 }} />}
                        title="No stock transactions found"
                        message="Stock movements from Sales and Purchases will appear here."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((txn, idx) => {
                    const isIn = txn.txnType === 'IN';
                    const rowNum = page * rowsPerPage + idx + 1;
                    return (
                      <TableRow
                        key={txn.id}
                        hover
                        sx={{
                          bgcolor: isIn
                            ? alpha('#22c55e', 0.03)
                            : alpha(theme.palette.error.main, 0.03),
                          '&:hover': {
                            bgcolor: isIn
                              ? alpha('#22c55e', 0.07)
                              : alpha(theme.palette.error.main, 0.07),
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="caption" color="text.disabled">{rowNum}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              bgcolor: 'background.default',
                              color: 'primary.main',
                              px: 0.8,
                              py: 0.3,
                              borderRadius: 1,
                              border: 1, borderColor: 'divider',
                            }}
                          >
                            {txn.itemCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{txn.itemName}</Typography>
                          <Typography variant="caption" color="text.disabled">{txn.unit}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TxnChip txnType={txn.txnType} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            color={isIn ? 'success.dark' : 'error.dark'}
                          >
                            {isIn ? '+' : '-'}{Number(txn.quantity).toFixed(3)} {txn.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {Number(txn.stockBefore).toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {Number(txn.stockAfter).toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <RefTypeBadge refType={txn.referenceType} />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}
                          >
                            {txn.referenceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {txn.createdAt
                              ? new Date(txn.createdAt).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                              : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Card>
    </Box>
  );
};

export default StockLedger;
