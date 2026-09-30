import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TableRow, TableCell, Skeleton,
  Typography, Stack, Button, TextField, MenuItem,
  Chip, IconButton, Tooltip, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import FilterBar from '../../components/common/FilterBar';
import AppTable from '../../components/common/AppTable';
import SalesReturnDialog from '../../components/salesReturn/SalesReturnDialog';
import salesReturnService from '../../services/salesReturnService';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SalesReturnHistory = () => {
  const navigate = useNavigate();

  const [salesReturnDialogOpen, setSalesReturnDialogOpen] = useState(false);
  const [returns, setReturns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pdfLoading, setPdfLoading] = useState(null);

  const loadSummary = async () => {
    try {
      const res = await salesReturnService.getSalesReturnSummary();
      if (res?.success) setSummary(res.data);
    } catch { }
  };

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesReturnService.getSalesReturns({
        page, size: rowsPerPage, search, status, fromDate: fromDate || null, toDate: toDate || null,
      });
      if (res?.success) {
        setReturns(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch { }
    finally { setLoading(false); }
  }, [page, rowsPerPage, search, status, fromDate, toDate]);

  useEffect(() => { loadSummary(); }, []);
  useEffect(() => { loadReturns(); }, [loadReturns]);

  const handleReset = () => {
    setSearch(''); setStatus('ALL'); setFromDate(''); setToDate(''); setPage(0);
  };

  const handlePdf = async (id, returnNumber) => {
    setPdfLoading(id);
    try {
      const blob = await salesReturnService.downloadSalesReturnPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${returnNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('PDF generation failed.'); }
    finally { setPdfLoading(null); }
  };

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Box>
      <PageHeader
        title="Sales Returns"
        description="View and manage all returned sales transactions."
        breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Returns', active: true }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => { loadSummary(); loadReturns(); }}>
              Refresh
            </Button>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setSalesReturnDialogOpen(true)}>
              New Return
            </Button>
          </Stack>
        }
      />

      {/* KPI Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2.5,
        mb: 3,
      }}>
        <StatCard
          title="Total Returns"
          value={summary?.totalReturns ?? '—'}
          icon={<AssignmentReturnOutlinedIcon />}
          subtitle="All time"
          color="warning"
        />
        <StatCard
          title="Return Amount"
          value={summary ? `₹ ${fmt(summary.totalReturnAmount)}` : '—'}
          icon={<AssignmentReturnOutlinedIcon />}
          subtitle="Completed returns"
          color="error"
        />
        <StatCard
          title="Refunded"
          value={summary ? `₹ ${fmt(summary.totalRefundAmount)}` : '—'}
          icon={<AssignmentReturnOutlinedIcon />}
          subtitle="Cash / Bank"
          color="success"
        />
        <StatCard
          title="Credit Adjusted"
          value={summary ? `₹ ${fmt(summary.totalAdjustmentAmount)}` : '—'}
          icon={<AssignmentReturnOutlinedIcon />}
          subtitle="Outstanding reduced"
          color="info"
        />
      </Box>

      {/* Filters */}
      <FilterBar
        isFiltered={search !== '' || status !== 'ALL' || fromDate !== '' || toDate !== ''}
        onReset={handleReset}
      >
        <TextField
          size="small"
          placeholder="Search return no., invoice, customer"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
          sx={{ minWidth: { xs: '100%', sm: 220 }, flex: 2 }}
        />
        <TextField
          select size="small" label="Status" value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField
          size="small" label="From Date" type="date" value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
          slotProps={{ inputLabel: { shrink: true } }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small" label="To Date" type="date" value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(0); }}
          slotProps={{ inputLabel: { shrink: true } }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
      </FilterBar>

      {/* Table */}
      <AppTable
        headContent={
          <TableRow>
            {['Return No.', 'Original Invoice', 'Date', 'Customer', 'Return Amount', 'Refund Mode', 'Status', 'Actions'].map((h) => (
              <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        }
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={(_, p) => setPage(p)}
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
        ) : returns.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} sx={{ p: 0 }}>
              <EmptyState
                icon={AssignmentReturnOutlinedIcon}
                message="No sales returns found. Create your first return by clicking 'New Return'."
              />
            </TableCell>
          </TableRow>
        ) : returns.map((ret) => (
          <TableRow key={ret.id} hover>
            <TableCell>
              <Typography variant="body2" fontWeight={700} color="primary.main">{ret.returnNumber}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{ret.invoiceNumber}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">
                {ret.returnDate ? new Date(ret.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>{ret.partyName}</Typography>
              <Typography variant="caption" color="text.secondary">{ret.partyCode}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={800} color="warning.dark">
                ₹ {fmt(ret.returnAmount)}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip
                size="small"
                label={ret.refundMode?.replace('_', ' ')}
                sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                variant="outlined"
              />
            </TableCell>
            <TableCell><StatusChip status={ret.status} /></TableCell>
            <TableCell>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => navigate(`/sales/returns/${ret.id}`)}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton size="small" onClick={() => handlePdf(ret.id, ret.returnNumber)} disabled={pdfLoading === ret.id}>
                    <PictureAsPdfOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </AppTable>

      <SalesReturnDialog
        open={salesReturnDialogOpen}
        onClose={() => setSalesReturnDialogOpen(false)}
        onSuccess={() => {
          loadReturns();
          loadSummary();
        }}
      />
    </Box>
  );
};

export default SalesReturnHistory;
