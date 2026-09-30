import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import SalesFilters from '../../components/sales/SalesFilters';
import SalesTable from '../../components/sales/SalesTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CreateSaleDialog from '../../components/sales/CreateSaleDialog';
import salesService from '../../services/salesService';
import { formatCurrency } from '../../utils/saleCalculations';

/**
 * Sales History Page — /sales
 * Comprehensive enterprise sales invoices management with filtered summary cards,
 * multi-criteria filters, server pagination, print, and PDF generation.
 */
const Sales = () => {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Server Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Active Filters
  const [search, setSearch] = useState('');
  const [partyId, setPartyId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Cancel dialog state
  const [cancelSaleTarget, setCancelSaleTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Create Sale Dialog
  const [createSaleOpen, setCreateSaleOpen] = useState(false);

  // Fetch KPI aggregates with active filters
  const loadSummary = useCallback(async () => {
    try {
      const res = await salesService.getSaleSummary({
        search, partyId, paymentStatus, status, fromDate, toDate,
      });
      if (res?.success) {
        setSummary(res.data);
      }
    } catch {
      // Handled silently by interceptor
    }
  }, [search, partyId, paymentStatus, status, fromDate, toDate]);

  // Fetch paginated sales records
  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesService.getSales({
        page,
        size: rowsPerPage,
        search,
        partyId,
        paymentStatus,
        status,
        fromDate,
        toDate,
      });
      if (res?.success) {
        setSales(res.data?.content || []);
        setTotalElements(res.data?.totalElements || 0);
      }
    } catch {
      // Handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, partyId, paymentStatus, status, fromDate, toDate]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleRefresh = () => {
    loadSummary();
    loadSales();
    toast.success('Sales history refreshed');
  };

  const handleResetFilters = () => {
    setSearch('');
    setPartyId('');
    setPaymentStatus('ALL');
    setStatus('ALL');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  const handleView = (sale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handlePrint = (sale) => {
    navigate(`/sales/${sale.id}?print=true`);
  };

  const handleDownloadPdf = async (sale) => {
    const toastId = toast.loading(`Generating PDF for ${sale.invoiceNumber}...`);
    try {
      await salesService.downloadSalePdf(sale.id, sale.invoiceNumber);
      toast.success(`Downloaded ${sale.invoiceNumber}.pdf`, { id: toastId });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to download PDF', { id: toastId });
    }
  };

  const handleOpenCancelDialog = (sale) => {
    setCancelSaleTarget(sale);
  };

  const handleConfirmCancel = async () => {
    if (!cancelSaleTarget) return;
    setCancelling(true);
    try {
      const res = await salesService.cancelSale(cancelSaleTarget.id);
      if (res?.success) {
        toast.success(`Invoice ${cancelSaleTarget.invoiceNumber} cancelled. Stock restored.`);
        loadSales();
        loadSummary();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel sale');
    } finally {
      setCancelling(false);
      setCancelSaleTarget(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Sales History"
        description="View, search and manage sales invoices."
        actions={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateSaleOpen(true)}>
              New Sale
            </Button>
          </Stack>
        }
      />

      {/* KPI Summary Cards */}
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
          title="Total Invoices"
          value={summary?.totalInvoices != null ? summary.totalInvoices : '—'}
          icon={<ReceiptLongOutlinedIcon />}
          subtitle={`${summary?.paidCount || 0} Paid · ${summary?.partialCount || 0} Partial`}
          color="primary"
        />
        <StatCard
          title="Total Sales"
          value={summary?.totalRevenue != null ? formatCurrency(summary.totalRevenue) : '—'}
          icon={<CurrencyRupeeIcon />}
          subtitle={`Filtered across ${summary?.totalInvoices || 0} bills`}
          color="info"
        />
        <StatCard
          title="Total Paid"
          value={summary?.totalCollected != null ? formatCurrency(summary.totalCollected) : '—'}
          icon={<CheckCircleOutlinedIcon />}
          subtitle="Collections received"
          color="success"
        />
        <StatCard
          title="Total Outstanding"
          value={summary?.totalOutstanding != null ? formatCurrency(summary.totalOutstanding) : '—'}
          icon={<HourglassEmptyOutlinedIcon />}
          subtitle={`${(summary?.partialCount || 0) + (summary?.pendingCount || 0)} invoices pending`}
          color="warning"
        />
      </Box>

      {/* Advanced Filter Bar */}
      <SalesFilters
        search={search}
        partyId={partyId}
        paymentStatus={paymentStatus}
        status={status}
        fromDate={fromDate}
        toDate={toDate}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onPartyChange={(v) => { setPartyId(v); setPage(0); }}
        onPaymentStatusChange={(v) => { setPaymentStatus(v); setPage(0); }}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
        onFromDateChange={(v) => { setFromDate(v); setPage(0); }}
        onToDateChange={(v) => { setToDate(v); setPage(0); }}
        onReset={handleResetFilters}
      />

      {/* Paginated Data Table */}
      <SalesTable
        sales={sales}
        loading={loading}
        totalElements={totalElements}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onView={handleView}
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        onCancelSale={handleOpenCancelDialog}
      />

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelSaleTarget)}
        title="Cancel Sales Invoice?"
        message={
          cancelSaleTarget
            ? `Are you sure you want to cancel invoice ${cancelSaleTarget.invoiceNumber} for ${cancelSaleTarget.partyName}? All deducted inventory stock quantities will be restored back to stock.`
            : ''
        }
        confirmText="Confirm Cancellation"
        cancelText="Dismiss"
        severity="error"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelSaleTarget(null)}
      />

      {/* Create Sale Modal */}
      <CreateSaleDialog
        open={createSaleOpen}
        onClose={() => setCreateSaleOpen(false)}
        onSuccess={() => {
          loadSales();
          loadSummary();
        }}
      />
    </Box>
  );
};

export default Sales;
