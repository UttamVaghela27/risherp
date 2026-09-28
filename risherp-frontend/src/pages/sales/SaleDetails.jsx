import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Button, Stack, Skeleton, Alert, CircularProgress
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import InvoicePrintView from '../../components/sales/InvoicePrintView';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ErrorState from '../../components/common/ErrorState';
import salesService from '../../services/salesService';
import { useAuth } from '../../context/AuthContext';

/**
 * SaleDetails — /sales/:id
 * Full invoice detail view with Print, PDF download, and Cancellation capabilities.
 */
const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const printTriggered = useRef(false);
  const { user } = useAuth();
  const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadSale = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesService.getSaleById(id);
      if (res?.success) {
        setSale(res.data);
      } else {
        setError('Sale not found.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sale details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadSale(); }, [loadSale]);

  // Auto-trigger print if navigated with ?print=true
  useEffect(() => {
    if (sale && searchParams.get('print') === 'true' && !printTriggered.current) {
      printTriggered.current = true;
      setTimeout(() => window.print(), 500);
    }
  }, [sale, searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!sale) return;
    setPdfLoading(true);
    try {
      await salesService.downloadSalePdf(sale.id, sale.invoiceNumber);
      toast.success(`PDF downloaded: ${sale.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!sale) return;
    setCancelling(true);
    try {
      const res = await salesService.cancelSale(sale.id);
      if (res?.success) {
        toast.success(`Sale ${sale.invoiceNumber} has been cancelled and stock restored.`);
        setSale(res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel sale');
    } finally {
      setCancelling(false);
      setCancelModalOpen(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Sale Details" description="Loading invoice..." />
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
          {[...Array(8)].map((_, i) => <Skeleton key={i} height={36} sx={{ mb: 1 }} />)}
        </Paper>
      </Box>
    );
  }

  if (error || !sale) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <ErrorState
          message={error || 'The requested invoice could not be found.'}
          onRetry={() => navigate('/sales')}
        />
      </Box>
    );
  }

  const isCancelled = sale.status === 'CANCELLED';

  return (
    <Box>
      {/* Screen Header — hidden during print */}
      <Box className="no-print">
        <PageHeader
          title={`Invoice ${sale.invoiceNumber}`}
          description={`Sale for ${sale.partyName} on ${sale.saleDate}`}
          action={{
            label: 'Print Invoice',
            icon: <PrintIcon />,
            variant: 'contained',
            color: 'primary',
            onClick: handlePrint,
          }}
          secondaryAction={{
            label: 'Back to Sales',
            icon: <ArrowBackIcon />,
            variant: 'outlined',
            onClick: () => navigate('/sales'),
          }}
        />

        {/* Action Toolbar */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: '16px', border: 1, borderColor: 'divider', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print Invoice
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={pdfLoading ? <CircularProgress size={18} /> : <PictureAsPdfIcon />}
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<AddIcon />}
                onClick={() => navigate('/sales/new')}
              >
                New Sale
              </Button>
            </Stack>

            {canCancel && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setCancelModalOpen(true)}
                disabled={isCancelled}
              >
                {isCancelled ? 'Sale Cancelled' : 'Cancel Sale'}
              </Button>
            )}
          </Stack>
        </Paper>

        {isCancelled && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            This sales transaction was <strong>CANCELLED</strong>. Deducted stock quantities have been reversed back to inventory.
          </Alert>
        )}
      </Box>

      {/* Invoice Card Container */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: '16px',
          border: 1, borderColor: 'divider',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <InvoicePrintView invoice={sale} />
      </Paper>

      {/* Bottom Back Button (Screen only) */}
      <Box className="no-print" sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="inherit"
          onClick={() => navigate('/sales')}
          sx={{ minWidth: 160 }}
        >
          Back to Sales History
        </Button>
      </Box>

      {/* Confirmation Dialog for Sale Cancellation */}
      <ConfirmDialog
        open={cancelModalOpen}
        title="Cancel Sales Invoice?"
        message={`Are you sure you want to cancel invoice ${sale.invoiceNumber}? This action will permanently mark the invoice as CANCELLED and restore the deducted items back to inventory stock.`}
        confirmText="Yes, Cancel Sale"
        cancelText="Keep Invoice"
        severity="error"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </Box>
  );
};

export default SaleDetails;
