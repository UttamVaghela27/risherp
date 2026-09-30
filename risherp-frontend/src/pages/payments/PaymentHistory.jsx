import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TableCell, TableRow, Skeleton,
  TextField, MenuItem,
  IconButton, Tooltip, Typography, Button, Stack, InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import FilterBar from '../../components/common/FilterBar';
import AppTable from '../../components/common/AppTable';
import PaymentDialog from '../../components/payment/PaymentDialog';
import paymentTxnService from '../../services/paymentTxnService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function PaymentHistory() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [paymentMode, setPaymentMode] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await paymentTxnService.getPaymentSummary();
      setSummary(res.data || res);
    } catch {
      // Non-blocking
    }
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentTxnService.getPayments({
        page,
        size: rowsPerPage,
        search,
        status,
        paymentMode,
        fromDate: fromDate || null,
        toDate: toDate || null,
      });
      const data = res.data || res;
      setPayments(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error('Failed to load supplier payments');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, status, paymentMode, fromDate, toDate]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPayments();
  };

  const handleDownloadPdf = async (e, id, paymentNumber) => {
    e.stopPropagation();
    try {
      toast.loading('Generating Payment Voucher PDF...', { id: 'pdf' });
      const blob = await paymentTxnService.downloadPaymentPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paymentNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Payment Voucher PDF downloaded', { id: 'pdf' });
    } catch {
      toast.error('Failed to download Payment Voucher PDF', { id: 'pdf' });
    }
  };

  // Detect if any filter is active (for FilterBar reset button visibility)
  const isFiltered =
    search !== '' ||
    status !== 'ALL' ||
    paymentMode !== 'ALL' ||
    fromDate !== '' ||
    toDate !== '';

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPaymentMode('ALL');
    setFromDate('');
    setToDate('');
    setPage(0);
    fetchSummary();
  };

  // Table head row passed to AppTable via headContent prop
  const tableHead = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Payment No.</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Date</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Supplier</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Amount</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mode</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ref No.</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Allocated</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Advance / Unallocated</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Status</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Actions</TableCell>
    </TableRow>
  );

  return (
    <Box>
      <PageHeader
        title="Supplier Payments"
        subtitle="Manage outgoing vendor settlements, purchase allocations, and supplier advances"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setPaymentDialogOpen(true)}
          >
            New Payment
          </Button>
        }
      />

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3 }}>
        <StatCard
          title="Total Payments"
          value={summary?.totalPayments ?? 0}
          icon={PaymentsOutlinedIcon}
          subtitle={`${summary?.completedPayments ?? 0} Completed • ${summary?.todayPayments ?? 0} Today`}
          color="warning"
        />
        <StatCard
          title="Total Paid Out"
          value={formatCurrency(summary?.totalAmount ?? 0)}
          icon={PaymentsOutlinedIcon}
          color="error"
        />
        <StatCard
          title="Cash Payments"
          value={formatCurrency(summary?.cashAmount ?? 0)}
          icon={AccountBalanceWalletOutlinedIcon}
          color="primary"
        />
        <StatCard
          title="Bank & UPI Payments"
          value={formatCurrency((summary?.bankAmount ?? 0) + (summary?.upiAmount ?? 0))}
          icon={AccountBalanceWalletOutlinedIcon}
          color="secondary"
        />
      </Box>

      {/* Filter Toolbar */}
      <FilterBar isFiltered={isFiltered} onReset={handleResetFilters}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'contents' }}>
          <TextField
            size="small"
            placeholder="Search Payment #, Supplier, Ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 240 }, flex: 2 }}
          />

          <TextField
            select
            size="small"
            label="Mode"
            value={paymentMode}
            onChange={(e) => { setPaymentMode(e.target.value); setPage(0); }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="ALL">All Modes</MenuItem>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="CHEQUE">Cheque</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>

          <TextField
            type="date"
            size="small"
            label="From Date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            slotProps={{ inputLabel: { shrink: true } }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            type="date"
            size="small"
            label="To Date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(0); }}
            slotProps={{ inputLabel: { shrink: true } }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <Button type="submit" variant="outlined" color="primary" sx={{ borderRadius: '10px', height: 40, px: 2, flexShrink: 0 }}>
            Filter
          </Button>
        </form>
      </FilterBar>

      {/* Payments Table */}
      <AppTable
        headContent={tableHead}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      >
        {loading ? (
          Array.from({ length: rowsPerPage > 10 ? 10 : rowsPerPage }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 10 }).map((_, j) => (
                <TableCell key={j}><Skeleton variant="text" height={24} /></TableCell>
              ))}
            </TableRow>
          ))
        ) : payments.length > 0 ? (
          payments.map((pmt) => (
            <TableRow
              key={pmt.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/payments/${pmt.id}`)}
            >
              <TableCell>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: pmt.status === 'CANCELLED' ? theme.palette.background.default : alpha(theme.palette.info.main, 0.1),
                    color: pmt.status === 'CANCELLED' ? 'text.secondary' : theme.palette.info.dark,
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: pmt.status === 'CANCELLED' ? theme.palette.divider : alpha(theme.palette.info.main, 0.2),
                    display: 'inline-block',
                    textDecoration: pmt.status === 'CANCELLED' ? 'line-through' : 'none',
                  }}
                >
                  {pmt.paymentNumber}
                </Typography>
              </TableCell>

              <TableCell>{formatDate(pmt.paymentDate)}</TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {pmt.partyName}
                </Typography>
                {pmt.partyCode && (
                  <Typography variant="caption" color="text.secondary">
                    {pmt.partyCode}
                  </Typography>
                )}
              </TableCell>

              <TableCell align="right">
                <Typography variant="body2" fontWeight={700} color="error.main">
                  {formatCurrency(pmt.amount)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, backgroundColor: 'action.hover' }}>
                  {pmt.paymentMode ? pmt.paymentMode.replace('_', ' ') : 'N/A'}
                </Typography>
              </TableCell>

              <TableCell>{pmt.referenceNumber || '—'}</TableCell>

              <TableCell align="right">{formatCurrency(pmt.allocatedAmount || 0)}</TableCell>

              <TableCell align="right">
                {(pmt.unallocatedAmount || 0) > 0 ? (
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {formatCurrency(pmt.unallocatedAmount)}
                  </Typography>
                ) : (
                  '—'
                )}
              </TableCell>

              <TableCell align="center">
                <StatusChip status={pmt.status} />
              </TableCell>

              <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/payments/${pmt.id}`)}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download Payment Voucher PDF">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={(e) => handleDownloadPdf(e, pmt.id, pmt.paymentNumber)}
                    >
                      <PictureAsPdfOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={10} sx={{ p: 0 }}>
              <EmptyState
                icon={PaymentsOutlinedIcon}
                message="No supplier payments found. Record your first vendor settlement."
              />
            </TableCell>
          </TableRow>
        )}
      </AppTable>

      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSuccess={() => {
          fetchPayments();
          fetchSummary();
        }}
      />
    </Box>
  );
}
