import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Button, Stack, Skeleton, Alert, CircularProgress
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import PurchasePrintView from '../../components/purchase/PurchasePrintView';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import purchaseService from '../../services/purchaseService';
import { useAuth } from '../../context/AuthContext';

/**
 * PurchaseDetails — /purchases/:id
 * Displays full purchase invoice details with Print, PDF download, and safe cancellation.
 */
const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const printTriggered = useRef(false);

  const { user } = useAuth();
  const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Cancel state
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadPurchase = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchaseService.getPurchaseById(id);
      if (res?.success) {
        setPurchase(res.data);
      } else {
        setError('Purchase record not found.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load purchase details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPurchase();
  }, [loadPurchase]);

  // Auto-trigger print if query param print=true
  useEffect(() => {
    if (purchase && searchParams.get('print') === 'true' && !printTriggered.current) {
      printTriggered.current = true;
      setTimeout(() => window.print(), 500);
    }
  }, [purchase, searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!purchase) return;
    setPdfLoading(true);
    try {
      await purchaseService.downloadPurchasePdf(purchase.id, purchase.purchaseNumber);
      toast.success(`PDF downloaded: ${purchase.purchaseNumber}.pdf`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!purchase) return;
    setCancelling(true);
    try {
      const res = await purchaseService.cancelPurchase(purchase.id, 'Cancelled from Details Page');
      if (res?.success) {
        toast.success(`Purchase ${purchase.purchaseNumber} cancelled. Inventory restored.`);
        loadPurchase();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel purchase');
    } finally {
      setCancelling(false);
      setCancelOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error || !purchase) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorState
          title="Purchase Not Found"
          message={error || 'The requested purchase invoice could not be located.'}
          onRetry={loadPurchase}
        />
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/purchases')}
          sx={{ mt: 2 }}
        >
          Back to Purchases
        </Button>
      </Box>
    );
  }

  const isCancelled = purchase.status === 'CANCELLED';

  return (
    <Box sx={{ pb: 6 }}>
      {/* Screen Header & Action Toolbar — hidden during print */}
      <Box className="no-print">
        <PageHeader
          title={`Purchase ${purchase.purchaseNumber}`}
          description={`Supplier: ${purchase.partyName || '—'} • Date: ${purchase.purchaseDate || '—'}`}
          action={{
            label: 'Print Voucher',
            icon: <PrintIcon />,
            variant: 'contained',
            color: 'primary',
            onClick: handlePrint,
          }}
          secondaryAction={{
            label: 'Back to Purchases',
            icon: <ArrowBackIcon />,
            variant: 'outlined',
            onClick: () => navigate('/purchases'),
          }}
        />

        {/* Action Toolbar Card */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: '16px', border: 1, borderColor: 'divider', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print Voucher
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={pdfLoading ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<AddIcon />}
                onClick={() => navigate('/purchases/new')}
              >
                New Purchase
              </Button>
            </Stack>

            {canCancel && !isCancelled && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setCancelOpen(true)}
              >
                Cancel Purchase
              </Button>
            )}
          </Stack>
        </Paper>

        {isCancelled && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} variant="filled">
            This purchase invoice has been <strong>CANCELLED</strong>. All inventory stock additions have been reversed back to stock.
          </Alert>
        )}
      </Box>

      {/* Purchase Invoice / Voucher Card Container */}
      <Paper
        elevation={2}
        sx={{
          maxWidth: 900,
          mx: 'auto',
          borderRadius: '16px',
          overflow: 'hidden',
          border: 1, borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          bgcolor: 'background.paper',
          '@media print': {
            boxShadow: 'none',
            border: 'none',
            maxWidth: '100%',
            p: 0,
            m: 0,
          },
        }}
      >
        <PurchasePrintView purchase={purchase} />
      </Paper>

      {/* Bottom Back Button (Screen only) */}
      <Box className="no-print" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="inherit"
          onClick={() => navigate('/purchases')}
          sx={{ minWidth: 180 }}
        >
          Back to Purchases
        </Button>
      </Box>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Purchase Invoice?"
        message={`Are you sure you want to cancel purchase ${purchase.purchaseNumber} from ${purchase.partyName || 'supplier'}? All added stock quantities will be atomically reversed.`}
        confirmText="Confirm Cancellation"
        cancelText="Dismiss"
        severity="error"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </Box>
  );
};

export default PurchaseDetails;
