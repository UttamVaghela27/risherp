import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DetailCard, DetailRow, DetailKPICard } from '../../components/common/DetailCard';
import ReceiptPrintView from '../../components/receipt/ReceiptPrintView';
import receiptService from '../../services/receiptService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ReceiptDetails() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await receiptService.getReceiptById(id);
      setReceipt(res.data || res);
    } catch {
      toast.error('Failed to load receipt details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      toast.loading('Generating Receipt PDF...', { id: 'pdf' });
      const blob = await receiptService.downloadReceiptPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${receipt?.receiptNumber || 'Receipt'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Receipt PDF downloaded', { id: 'pdf' });
    } catch {
      toast.error('Failed to generate Receipt PDF', { id: 'pdf' });
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReceipt = async () => {
    setCancelling(true);
    try {
      const res = await receiptService.cancelReceipt(id);
      toast.success('Receipt cancelled. Invoice balances have been restored.');
      setReceipt(res.data || res);
      setCancelDialog(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel receipt.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Receipt Voucher" description="Loading transaction data..." />
        <Card sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <TableSkeleton rows={8} columns={4} />
        </Card>
      </Box>
    );
  }

  if (!receipt) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Receipt Voucher" />
        <Alert severity="error" sx={{ borderRadius: 2 }}>Receipt record not found.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => navigate('/receipts')}
        >
          Back to Receipts
        </Button>
      </Box>
    );
  }

  const isCancelled = receipt.status === 'CANCELLED';
  const totalAmount = Number(receipt.amount || 0);
  const allocated = Number(receipt.allocatedAmount || 0);
  const unallocated = Number(receipt.unallocatedAmount || 0);
  const allocationPercent = totalAmount > 0 ? Math.min(Math.round((allocated / totalAmount) * 100), 100) : 0;

  return (
    <Box>
      <Box className="no-print" sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <span>{receipt.receiptNumber}</span>
            <StatusChip status={receipt.status} />
          </Stack>
        }
        subtitle={`Payment received from ${receipt.partyName || 'Customer'}`}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ '@media print': { display: 'none' } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/receipts')}
              sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={pdfLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlinedIcon />}
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
            >
              Receipt PDF
            </Button>

            <Tooltip title="Print Receipt">
              <IconButton
                onClick={handlePrint}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: '8px',
                  '&:hover': { bgcolor: 'background.default' },
                }}
              >
                <PrintOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {!isCancelled && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setCancelDialog(true)}
              >
                Cancel Receipt
              </Button>
            )}
          </Stack>
        }
      />

      {isCancelled && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #fecaca' }}>
          This receipt voucher has been cancelled. All settled invoice balances have been restored and customer advance credit reversed.
        </Alert>
      )}

      {/* Top Executive KPI Summary Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Receipt Number"
            value={receipt.receiptNumber}
            subtitle="Receipt Voucher"
            icon={<ReceiptLongOutlinedIcon />}
            color="primary"
            badge={<StatusChip status={receipt.status} size="small" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Total Received"
            value={formatCurrency(totalAmount)}
            subtitle={`Mode: ${receipt.paymentMode ? receipt.paymentMode.replace('_', ' ') : 'N/A'}`}
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Customer"
            value={receipt.partyName || 'N/A'}
            subtitle={receipt.partyCode ? `Code: ${receipt.partyCode}` : 'Customer Account'}
            icon={<PersonOutlineOutlinedIcon />}
            color="indigo"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Receipt Date"
            value={formatDate(receipt.receiptDate)}
            subtitle={`Recorded by ${receipt.createdByName || 'Admin'}`}
            icon={<CalendarMonthOutlinedIcon />}
            color="violet"
          />
        </Grid>
      </Grid>

      {/* Details & Breakdown Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Payment & Receipt Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Payment & Receipt Info"
            subtitle="Transaction identification and receipt channel"
            icon={<ReceiptLongOutlinedIcon />}
            color="primary"
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Receipt Number"
                value={receipt.receiptNumber}
                icon={<ReceiptLongOutlinedIcon />}
                copyable
                isBold
              />
              <DetailRow
                label="Receipt Date"
                value={formatDate(receipt.receiptDate)}
                icon={<CalendarMonthOutlinedIcon />}
              />
              <DetailRow
                label="Payment Mode"
                value={receipt.paymentMode ? receipt.paymentMode.replace('_', ' ') : 'N/A'}
                customValue={
                  <Chip
                    label={receipt.paymentMode ? receipt.paymentMode.replace('_', ' ') : 'N/A'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: 'primary.dark',
                      border: '1px solid #bfdbfe',
                    }}
                  />
                }
              />
              {receipt.referenceNumber && (
                <DetailRow
                  label="Reference / Txn No."
                  value={receipt.referenceNumber}
                  copyable
                />
              )}
              <DetailRow
                label="Recorded By"
                value={receipt.createdByName || 'Admin'}
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>

        {/* Customer Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Customer Details"
            subtitle="Payer account details and billing address"
            icon={<PersonOutlineOutlinedIcon />}
            color="indigo"
            headerAction={
              receipt.partyCode && (
                <Chip
                  icon={<BadgeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                  label={receipt.partyCode}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.dark,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  }}
                />
              )
            }
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Customer Name"
                value={receipt.partyName}
                icon={<PersonOutlineOutlinedIcon />}
                isBold
              />
              <DetailRow
                label="Customer Code"
                value={receipt.partyCode}
                icon={<BadgeOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Phone / Mobile"
                value={receipt.partyMobile}
                icon={<PhoneOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Email Address"
                value={receipt.partyEmail}
                icon={<EmailOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Address"
                value={[receipt.partyAddress, receipt.partyCity, receipt.partyState].filter(Boolean).join(', ')}
                icon={<PlaceOutlinedIcon />}
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>
      </Grid>

      {/* Settlements Table (Allocations to Invoices) */}
      <Card
        sx={{
          borderRadius: 3,
          border: 1, borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: 'background.default',
            borderBottom: 1, borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                color: theme.palette.success.main,
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary} fontSize="0.925rem">
                Invoice Settlements
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {receipt.allocations?.length > 0
                  ? `Receipt allocated across ${receipt.allocations.length} sales invoice(s)`
                  : 'No specific invoices settled; entire amount recorded as customer advance credit'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {receipt.allocations?.length > 0 ? (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Invoice Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Invoice Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Invoice Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Settled / Allocated Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipt.allocations.map((alloc, idx) => (
                  <TableRow key={alloc.id || idx} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{idx + 1}</TableCell>
                    <TableCell>
                      <Button
                        variant="text"
                        size="small"
                        endIcon={<LaunchOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          p: 0,
                          fontWeight: 700,
                          color: 'primary.main',
                          textTransform: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                        onClick={() => alloc.saleId && navigate(`/sales/${alloc.saleId}`)}
                      >
                        {alloc.invoiceNumber || `INV-${alloc.saleId}`}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {formatDate(alloc.saleDate)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(alloc.invoiceGrandTotal)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={750} color="success.main">
                        {formatCurrency(alloc.allocatedAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary">
              This receipt was recorded as a direct advance receipt. No prior sales invoices were settled.
            </Typography>
          </Box>
        )}
      </Card>

      {/* Financial Breakdown & Notes */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <DetailCard
            title="Notes & Remarks"
            subtitle="Transaction memos and auditing remarks"
            icon={<NotesOutlinedIcon />}
            color="indigo"
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: receipt.notes ? theme.palette.background.default : 'transparent',
                border: receipt.notes ? '1px dashed #cbd5e1' : 'none',
                minHeight: 100,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: receipt.notes ? theme.palette.text.secondary : 'text.secondary',
                  fontStyle: receipt.notes ? 'normal' : 'italic',
                  lineHeight: 1.6,
                }}
              >
                {receipt.notes || 'No notes or memo provided for this transaction.'}
              </Typography>
            </Box>
          </DetailCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <DetailCard
            title="Financial Breakdown"
            subtitle="Settlement balance and customer advance"
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="success"
          >
            <Stack spacing={1.5}>
              {/* Highlight Banner */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.success.dark, fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Amount Received
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.success.dark, fontSize: '0.75rem' }}>
                    Cash / Bank Inflow
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.success.dark, letterSpacing: '-0.02em' }}>
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>

              {/* Settlement Progress */}
              <Box sx={{ my: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Settlement Allocation
                  </Typography>
                  <Typography variant="caption" fontWeight={750} color="success.main">
                    {allocationPercent}% Allocated
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={allocationPercent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: 'success.main',
                    },
                  }}
                />
              </Box>

              <DetailRow
                label="Allocated to Invoices"
                value={formatCurrency(allocated)}
                isBold={allocated > 0}
              />
              <DetailRow
                label="Customer Advance / Credit"
                value={formatCurrency(unallocated)}
                valueColor="success.main"
                isBold
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialog}
        title="Cancel Customer Receipt"
        message={`Are you sure you want to cancel receipt ${receipt.receiptNumber}? This will restore the balance payable on all settled invoices and reverse customer credit. This action cannot be undone.`}
        confirmText={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        onConfirm={handleCancelReceipt}
        onCancel={() => setCancelDialog(false)}
        severity="error"
        loading={cancelling}
      />
      </Box>
      <ReceiptPrintView receipt={receipt} />
    </Box>
  );
}
