import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TableCell, TableRow, Skeleton,
  TextField, MenuItem,
  IconButton, Tooltip, Typography, Button, Stack, InputAdornment,
} from '@mui/material';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import FilterBar from '../../components/common/FilterBar';
import AppTable from '../../components/common/AppTable';
import PurchaseReturnDialog from '../../components/purchaseReturn/PurchaseReturnDialog';
import purchaseReturnService from '../../services/purchaseReturnService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function PurchaseReturnHistory() {
  const navigate = useNavigate();

  // State
  const [purchaseReturnDialogOpen, setPurchaseReturnDialogOpen] = useState(false);
  const [returns, setReturns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await purchaseReturnService.getPurchaseReturnSummary();
      setSummary(res.data || res);
    } catch {
      // Non-blocking
    }
  };

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchaseReturnService.getPurchaseReturns({
        page,
        size: rowsPerPage,
        search,
        status,
        fromDate: fromDate || null,
        toDate: toDate || null,
      });
      const data = res.data || res;
      setReturns(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error('Failed to load purchase returns');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, status, fromDate, toDate]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchReturns();
  };

  const handleDownloadPdf = async (e, id, returnNumber) => {
    e.stopPropagation();
    try {
      toast.loading('Generating Debit Note PDF...', { id: 'pdf' });
      const blob = await purchaseReturnService.downloadPurchaseReturnPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${returnNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Debit Note PDF downloaded', { id: 'pdf' });
    } catch {
      toast.error('Failed to download Debit Note PDF', { id: 'pdf' });
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Purchase Returns / Debit Notes"
        subtitle="View and manage returned purchase transactions and vendor debit adjustments"
        actions={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => { fetchSummary(); fetchReturns(); }}>
              Refresh
            </Button>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setPurchaseReturnDialogOpen(true)}>
              New Purchase Return
            </Button>
          </Stack>
        }
      />

      {/* KPI Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2.5,
        mb: 3,
      }}>
        <StatCard
          title="Total Returns"
          value={summary?.totalReturns ?? 0}
          icon={UndoOutlinedIcon}
          subtitle={`${summary?.completedReturns ?? 0} Completed • ${summary?.todayReturns ?? 0} Today`}
          color="warning"
        />
        <StatCard
          title="Total Return Amount"
          value={formatCurrency(summary?.totalReturnAmount ?? 0)}
          icon={CurrencyExchangeOutlinedIcon}
          color="error"
        />
        <StatCard
          title="Total Cash / Bank Refund"
          value={formatCurrency(summary?.totalRefundAmount ?? 0)}
          icon={AccountBalanceWalletOutlinedIcon}
          color="success"
        />
        <StatCard
          title="Total Debit / Adjustment"
          value={formatCurrency(summary?.totalAdjustmentAmount ?? 0)}
          icon={UndoOutlinedIcon}
          color="info"
        />
      </Box>

      {/* Filter Toolbar */}
      <FilterBar
        isFiltered={search !== '' || status !== 'ALL' || fromDate !== '' || toDate !== ''}
        onReset={() => { setSearch(''); setStatus('ALL'); setFromDate(''); setToDate(''); setPage(0); fetchSummary(); }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'contents' }}>
          <TextField
            size="small"
            placeholder="Search Return #, Purchase #, Supplier..."
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
            select size="small" label="Status" value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
          <TextField
            type="date" size="small" label="From Date" value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            slotProps={{ inputLabel: { shrink: true } }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            type="date" size="small" label="To Date" value={toDate}
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

      {/* Table */}
      <AppTable
        headContent={
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Return Number</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Original Purchase</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Supplier</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Date</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Return Amount</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Adjustment Mode</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Status</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Actions</TableCell>
          </TableRow>
        }
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      >
        {loading ? (
          Array.from({ length: rowsPerPage > 10 ? 10 : rowsPerPage }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
                <TableCell key={j}><Skeleton variant="text" height={24} /></TableCell>
              ))}
            </TableRow>
          ))
        ) : returns.length > 0 ? (
          returns.map((ret) => (
            <TableRow
              key={ret.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/purchases/returns/${ret.id}`)}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {ret.returnNumber}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {ret.purchaseNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(ret.purchaseDate)}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {ret.partyName}
                </Typography>
                {ret.partyCode && (
                  <Typography variant="caption" color="text.secondary">
                    {ret.partyCode}
                  </Typography>
                )}
              </TableCell>

              <TableCell>{formatDate(ret.returnDate)}</TableCell>

              <TableCell align="right">
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(ret.returnAmount)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, backgroundColor: 'action.hover' }}>
                  {ret.refundMode ? ret.refundMode.replace('_', ' ') : 'CREDIT ADJUSTMENT'}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <StatusChip status={ret.status} />
              </TableCell>

              <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="View Return Details">
                    <IconButton size="small" color="primary" onClick={() => navigate(`/purchases/returns/${ret.id}`)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Debit Note PDF">
                    <IconButton size="small" color="secondary" onClick={(e) => handleDownloadPdf(e, ret.id, ret.returnNumber)}>
                      <PictureAsPdfOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} sx={{ p: 0 }}>
              <EmptyState
                icon={UndoOutlinedIcon}
                message="No purchase returns found. Create your first return against a purchase invoice."
              />
            </TableCell>
          </TableRow>
        )}
      </AppTable>

      <PurchaseReturnDialog
        open={purchaseReturnDialogOpen}
        onClose={() => setPurchaseReturnDialogOpen(false)}
        onSuccess={() => {
          fetchReturns();
          fetchSummary();
        }}
      />
    </Box>
  );
}

