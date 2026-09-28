import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import PurchaseSummaryCards from '../../components/purchase/PurchaseSummaryCards';
import PurchaseFilters from '../../components/purchase/PurchaseFilters';
import PurchaseTable from '../../components/purchase/PurchaseTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CreatePurchaseDialog from '../../components/purchase/CreatePurchaseDialog';
import purchaseService from '../../services/purchaseService';

/**
 * Purchase History Page — /purchases
 * Comprehensive enterprise purchase invoices management with filtered summary cards,
 * multi-criteria filters, server pagination, print, and PDF generation.
 */
const PurchaseHistory = () => {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
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
  const [cancelPurchaseTarget, setCancelPurchaseTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Create Purchase Dialog
  const [createPurchaseOpen, setCreatePurchaseOpen] = useState(false);

  // Fetch authoritative KPI aggregates with active filters
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await purchaseService.getPurchaseSummary({
        search, partyId, paymentStatus, status, fromDate, toDate,
      });
      if (res?.success) {
        setSummary(res.data);
      }
    } catch {
      // Handled silently
    } finally {
      setSummaryLoading(false);
    }
  }, [search, partyId, paymentStatus, status, fromDate, toDate]);

  // Fetch paginated purchase records
  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchaseService.getPurchases({
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
        setPurchases(res.data?.content || []);
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
    loadPurchases();
  }, [loadPurchases]);

  const handleRefresh = () => {
    loadSummary();
    loadPurchases();
    toast.success('Purchase history refreshed');
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

  const handleView = (purchase) => {
    navigate(`/purchases/${purchase.id}`);
  };

  const handlePrint = (purchase) => {
    navigate(`/purchases/${purchase.id}?print=true`);
  };

  const handleDownloadPdf = async (purchase) => {
    const toastId = toast.loading(`Generating PDF for ${purchase.purchaseNumber}...`);
    try {
      await purchaseService.downloadPurchasePdf(purchase.id, purchase.purchaseNumber);
      toast.success(`Downloaded ${purchase.purchaseNumber}.pdf`, { id: toastId });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to download PDF', { id: toastId });
    }
  };

  const handleOpenCancelDialog = (purchase) => {
    setCancelPurchaseTarget(purchase);
  };

  const handleConfirmCancel = async () => {
    if (!cancelPurchaseTarget) return;
    setCancelling(true);
    try {
      const res = await purchaseService.cancelPurchase(cancelPurchaseTarget.id, 'Cancelled from Purchase History');
      if (res?.success) {
        toast.success(`Purchase ${cancelPurchaseTarget.purchaseNumber} cancelled. Inventory restored.`);
        loadPurchases();
        loadSummary();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel purchase');
    } finally {
      setCancelling(false);
      setCancelPurchaseTarget(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Purchase History"
        description="View, search and manage vendor bills and purchase receipts."
        actions={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreatePurchaseOpen(true)}>
              New Purchase
            </Button>
          </Stack>
        }
      />

      {/* KPI Summary Cards */}
      <PurchaseSummaryCards summary={summary} loading={summaryLoading} />

      {/* Advanced Filter Bar */}
      <PurchaseFilters
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
      <PurchaseTable
        purchases={purchases}
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
        onCancelPurchase={handleOpenCancelDialog}
      />

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelPurchaseTarget)}
        title="Cancel Purchase Invoice?"
        message={
          cancelPurchaseTarget
            ? `Are you sure you want to cancel purchase ${cancelPurchaseTarget.purchaseNumber} from ${cancelPurchaseTarget.partyName || 'supplier'}? All added inventory stock quantities will be atomically reversed.`
            : ''
        }
        confirmText="Confirm Cancellation"
        cancelText="Dismiss"
        severity="error"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelPurchaseTarget(null)}
      />

      {/* Create Purchase Modal */}
      <CreatePurchaseDialog
        open={createPurchaseOpen}
        onClose={() => setCreatePurchaseOpen(false)}
        onSuccess={() => {
          loadPurchases();
          loadSummary();
        }}
      />
    </Box>
  );
};

export default PurchaseHistory;
