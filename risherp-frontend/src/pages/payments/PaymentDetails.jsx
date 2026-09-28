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
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DetailCard, DetailRow, DetailKPICard } from '../../components/common/DetailCard';
import PaymentPrintView from '../../components/payment/PaymentPrintView';
import paymentTxnService from '../../services/paymentTxnService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function PaymentDetails() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentTxnService.getPaymentById(id);
      setPayment(res.data || res);
    } catch {
      toast.error('Failed to load payment details');
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
      toast.loading('Generating Payment Voucher PDF...', { id: 'pdf' });
      const blob = await paymentTxnService.downloadPaymentPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${payment?.paymentNumber || 'PaymentVoucher'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Payment Voucher PDF downloaded', { id: 'pdf' });
    } catch {
      toast.error('Failed to generate Payment Voucher PDF', { id: 'pdf' });
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelPayment = async () => {
    setCancelling(true);
    try {
      const res = await paymentTxnService.cancelPayment(id);
      toast.success('Payment cancelled. Purchase balances have been restored.');
      setPayment(res.data || res);
      setCancelDialog(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel payment.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Payment Voucher" description="Loading transaction data..." />
        <Card sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <TableSkeleton rows={8} columns={4} />
        </Card>
      </Box>
    );
  }

  if (!payment) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Payment Voucher" />
        <Alert severity="error" sx={{ borderRadius: 2 }}>Payment record not found.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => navigate('/payments')}
        >
          Back to Payments
        </Button>
      </Box>
    );
  }

  const isCancelled = payment.status === 'CANCELLED';
  const totalAmount = Number(payment.amount || 0);
  const allocated = Number(payment.allocatedAmount || 0);
  const unallocated = Number(payment.unallocatedAmount || 0);
  const allocationPercent = totalAmount > 0 ? Math.min(Math.round((allocated / totalAmount) * 100), 100) : 0;

  return (
    <Box>
      <Box className="no-print" sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <span>{payment.paymentNumber}</span>
            <StatusChip status={payment.status} />
          </Stack>
        }
        subtitle={`Payment voucher disbursed to ${payment.partyName || 'Supplier'}`}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ '@media print': { display: 'none' } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/payments')}
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
              Payment Voucher PDF
            </Button>

            <Tooltip title="Print Voucher">
              <IconButton
                onClick={handlePrint}
                sx={{
                  border: '1px solid #cbd5e1',
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
                Cancel Payment
              </Button>
            )}
          </Stack>
        }
      />

      {isCancelled && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #fecaca' }}>
          This payment voucher has been cancelled. All settled purchase balances have been restored and supplier debit reversed.
        </Alert>
      )}

      {/* Top Executive KPI Summary Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Voucher Number"
            value={payment.paymentNumber}
            subtitle="Payment Voucher"
            icon={<ReceiptLongOutlinedIcon />}
            color="primary"
            badge={<StatusChip status={payment.status} size="small" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Total Paid"
            value={formatCurrency(totalAmount)}
            subtitle={`Mode: ${payment.paymentMode ? payment.paymentMode.replace('_', ' ') : 'N/A'}`}
            icon={<PaymentsOutlinedIcon />}
            color="error"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Supplier / Vendor"
            value={payment.partyName || 'N/A'}
            subtitle={payment.partyCode ? `Code: ${payment.partyCode}` : 'Vendor Account'}
            icon={<StoreOutlinedIcon />}
            color="secondary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Payment Date"
            value={formatDate(payment.paymentDate)}
            subtitle={`Disbursed by ${payment.createdByName || 'Admin'}`}
            icon={<CalendarMonthOutlinedIcon />}
            color="violet"
          />
        </Grid>
      </Grid>

      {/* Details & Breakdown Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Payment Voucher Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Payment Voucher Details"
            subtitle="Transaction identification and disbursement channel"
            icon={<PaymentsOutlinedIcon />}
            color="primary"
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Voucher Number"
                value={payment.paymentNumber}
                icon={<ReceiptLongOutlinedIcon />}
                copyable
                isBold
              />
              <DetailRow
                label="Payment Date"
                value={formatDate(payment.paymentDate)}
                icon={<CalendarMonthOutlinedIcon />}
              />
              <DetailRow
                label="Payment Mode"
                value={payment.paymentMode ? payment.paymentMode.replace('_', ' ') : 'N/A'}
                customValue={
                  <Chip
                    label={payment.paymentMode ? payment.paymentMode.replace('_', ' ') : 'N/A'}
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
              {payment.referenceNumber && (
                <DetailRow
                  label="Reference / Cheque No."
                  value={payment.referenceNumber}
                  copyable
                />
              )}
              <DetailRow
                label="Disbursed By"
                value={payment.createdByName || 'Admin'}
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>

        {/* Supplier / Vendor Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Supplier / Vendor Profile"
            subtitle="Payee account details and registered address"
            icon={<StoreOutlinedIcon />}
            color="secondary"
            headerAction={
              payment.partyCode && (
                <Chip
                  icon={<BadgeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                  label={payment.partyCode}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: '#f0fdf4',
                    color: '#0f766e',
                    border: '1px solid #99f6e4',
                  }}
                />
              )
            }
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Supplier Name"
                value={payment.partyName}
                icon={<StoreOutlinedIcon />}
                isBold
              />
              <DetailRow
                label="Supplier Code"
                value={payment.partyCode}
                icon={<BadgeOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Phone / Mobile"
                value={payment.partyMobile}
                icon={<PhoneOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Email Address"
                value={payment.partyEmail}
                icon={<EmailOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Address"
                value={[payment.partyAddress, payment.partyCity, payment.partyState].filter(Boolean).join(', ')}
                icon={<PlaceOutlinedIcon />}
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>
      </Grid>

      {/* Settlements Table (Allocations to Purchases) */}
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
            bgcolor: '#fafbfc',
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
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ccfbf1 100%)',
                color: '#0f766e',
                border: '1px solid #99f6e4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary} fontSize="0.925rem">
                Purchase Settlements
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {payment.allocations?.length > 0
                  ? `Payment allocated across ${payment.allocations.length} purchase bill(s)`
                  : 'No specific bills settled; entire amount treated as supplier advance debit'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {payment.allocations?.length > 0 ? (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Purchase Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Purchase Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Purchase Bill Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Settled / Allocated Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payment.allocations.map((alloc, idx) => (
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
                        onClick={() => alloc.purchaseId && navigate(`/purchases/${alloc.purchaseId}`)}
                      >
                        {alloc.purchaseNumber || `PUR-${alloc.purchaseId}`}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {formatDate(alloc.purchaseDate)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(alloc.purchaseGrandTotal)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={750} color="error.main">
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
              This disbursement was recorded as a direct advance payment. No prior purchase invoices were settled.
            </Typography>
          </Box>
        )}
      </Card>

      {/* Financial Breakdown & Notes */}
      <Grid container spacing={2.5}>
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
                bgcolor: payment.notes ? theme.palette.background.default : 'transparent',
                border: payment.notes ? '1px dashed #cbd5e1' : 'none',
                minHeight: 100,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: payment.notes ? theme.palette.text.secondary : 'text.secondary',
                  fontStyle: payment.notes ? 'normal' : 'italic',
                  lineHeight: 1.6,
                }}
              >
                {payment.notes || 'No notes or memo provided for this transaction.'}
              </Typography>
            </Box>
          </DetailCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <DetailCard
            title="Financial Breakdown"
            subtitle="Settlement balance and supplier debit"
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="error"
          >
            <Stack spacing={1.5}>
              {/* Highlight Banner */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Amount Disbursed
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.error.dark, fontSize: '0.75rem' }}>
                    Cash / Bank Outflow
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.error.dark, letterSpacing: '-0.02em' }}>
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>

              {/* Settlement Progress */}
              <Box sx={{ my: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Settlement Allocation
                  </Typography>
                  <Typography variant="caption" fontWeight={750} color="primary.main">
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
                      bgcolor: allocationPercent === 100 ? 'success.main' : 'primary.main',
                    },
                  }}
                />
              </Box>

              <DetailRow
                label="Allocated to Purchases"
                value={formatCurrency(allocated)}
                isBold={allocated > 0}
              />
              <DetailRow
                label="Supplier Advance / Debit"
                value={formatCurrency(unallocated)}
                valueColor="primary.main"
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
        title="Cancel Supplier Payment"
        message={`Are you sure you want to cancel payment ${payment.paymentNumber}? This will restore the balance payable on all settled purchases and reverse supplier debit. This action cannot be undone.`}
        confirmText={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        onConfirm={handleCancelPayment}
        onCancel={() => setCancelDialog(false)}
        severity="error"
        loading={cancelling}
      />
      </Box>
      <PaymentPrintView payment={payment} />
    </Box>
  );
}
