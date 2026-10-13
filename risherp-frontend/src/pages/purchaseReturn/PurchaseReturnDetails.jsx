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
  useTheme,
  alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DetailCard, DetailRow, DetailKPICard } from '../../components/common/DetailCard';
import PurchaseReturnPrintView from '../../components/purchaseReturn/PurchaseReturnPrintView';
import purchaseReturnService from '../../services/purchaseReturnService';
import { formatCurrency, formatDate, formatQuantity } from '../../utils/formatters';

export default function PurchaseReturnDetails() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ret, setRet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchaseReturnService.getPurchaseReturnById(id);
      setRet(res.data || res);
    } catch {
      toast.error('Failed to load purchase return details');
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
      toast.loading('Generating Debit Note PDF...', { id: 'pdf' });
      const blob = await purchaseReturnService.downloadPurchaseReturnPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ret?.returnNumber || 'DebitNote'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Debit Note PDF downloaded', { id: 'pdf' });
    } catch {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReturn = async () => {
    setCancelling(true);
    try {
      const res = await purchaseReturnService.cancelPurchaseReturn(id);
      toast.success('Purchase return cancelled. Stock has been restored.');
      setRet(res.data || res);
      setCancelDialog(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel purchase return.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Purchase Return Details" description="Loading transaction data..." />
        <Card sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <TableSkeleton rows={8} columns={4} />
        </Card>
      </Box>
    );
  }

  if (!ret) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Purchase Return Details" />
        <Alert severity="error" sx={{ borderRadius: 2 }}>Purchase return not found.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => navigate('/purchases/returns')}
        >
          Back to Purchase Returns
        </Button>
      </Box>
    );
  }

  const isCancelled = ret.status === 'CANCELLED';

  return (
    <Box>
      <Box className="no-print" sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Page Header */}
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <span>{ret.returnNumber}</span>
            <StatusChip status={ret.status} />
          </Stack>
        }
        subtitle={`Debit Note against Purchase ${ret.purchaseNumber || 'N/A'}`}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ '@media print': { display: 'none' } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/purchases/returns')}
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
              Debit Note PDF
            </Button>

            <Tooltip title="Print Document">
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
                Cancel Return
              </Button>
            )}
          </Stack>
        }
      />

      {isCancelled && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #fecaca' }}>
          This purchase return has been cancelled. Inventory movements were reversed, and stock was restored.
        </Alert>
      )}

      {/* Top Executive KPI Summary Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Debit Note Number"
            value={ret.returnNumber}
            subtitle="Debit Note Voucher"
            icon={<AssignmentReturnOutlinedIcon />}
            color="primary"
            badge={<StatusChip status={ret.status} size="small" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Original Purchase"
            value={
              <Box
                component="span"
                onClick={() => ret.purchaseId && navigate(`/purchases/${ret.purchaseId}`)}
                sx={{
                  color: 'primary.main',
                  cursor: ret.purchaseId ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { textDecoration: ret.purchaseId ? 'underline' : 'none' },
                }}
              >
                {ret.purchaseNumber || 'N/A'}
                {ret.purchaseId && <LaunchOutlinedIcon sx={{ fontSize: 15 }} />}
              </Box>
            }
            subtitle={ret.purchaseDate ? `Dated: ${formatDate(ret.purchaseDate)}` : 'Purchase Bill'}
            icon={<ShoppingCartOutlinedIcon />}
            color="indigo"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Debit Amount"
            value={formatCurrency(ret.returnAmount || 0)}
            subtitle={`Adjustment: ${ret.refundMode ? ret.refundMode.replace('_', ' ') : 'CREDIT'}`}
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="error"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Return Date"
            value={formatDate(ret.returnDate)}
            subtitle={`Processed by ${ret.createdByName || 'Admin'}`}
            icon={<CalendarMonthOutlinedIcon />}
            color="violet"
          />
        </Grid>
      </Grid>

      {/* Details & Info Cards in Balanced Responsive Columns */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Original Purchase Reference */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Original Purchase Details"
            subtitle="Referenced procurement bill and timeline"
            icon={<ShoppingCartOutlinedIcon />}
            color="primary"
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Purchase Bill No."
                value={ret.purchaseNumber}
                icon={<ShoppingCartOutlinedIcon />}
                customValue={
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<LaunchOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                    sx={{
                      p: 0,
                      fontWeight: 700,
                      color: 'primary.main',
                      textTransform: 'none',
                    }}
                    onClick={() => ret.purchaseId && navigate(`/purchases/${ret.purchaseId}`)}
                  >
                    {ret.purchaseNumber}
                  </Button>
                }
              />
              <DetailRow
                label="Purchase Date"
                value={formatDate(ret.purchaseDate)}
                icon={<CalendarMonthOutlinedIcon />}
              />
              <DetailRow
                label="Return Date"
                value={formatDate(ret.returnDate)}
                icon={<CalendarMonthOutlinedIcon />}
              />
              <DetailRow
                label="Processed By"
                value={ret.createdByName || 'Admin'}
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>

        {/* Supplier Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Supplier Information"
            subtitle="Vendor account details and contact"
            icon={<StoreOutlinedIcon />}
            color="secondary"
            headerAction={
              ret.partyCode && (
                <Chip
                  icon={<BadgeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                  label={ret.partyCode}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.dark,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  }}
                />
              )
            }
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Supplier Name"
                value={ret.partyName}
                icon={<StoreOutlinedIcon />}
                isBold
              />
              <DetailRow
                label="Supplier Code"
                value={ret.partyCode}
                icon={<BadgeOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Phone / Mobile"
                value={ret.partyMobile}
                icon={<PhoneOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Email Address"
                value={ret.partyEmail}
                icon={<EmailOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Address"
                value={[ret.partyAddress, ret.partyCity, ret.partyState].filter(Boolean).join(', ')}
                icon={<PlaceOutlinedIcon />}
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>
      </Grid>

      {/* Items Table */}
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
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                color: theme.palette.error.main,
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary} fontSize="0.925rem">
                Returned Line Items & Outward Stock Movement
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(ret.items || []).length} item(s) dispatched back to supplier
              </Typography>
            </Box>
          </Stack>
        </Box>

        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item & Code</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Original Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Returned Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Rate</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Line Discount</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Return Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ret.items?.map((item, index) => (
                <TableRow key={item.id || index} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={650} color={theme.palette.text.primary}>
                      {item.itemNameSnapshot}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        label={item.itemCodeSnapshot || 'NO-CODE'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          bgcolor: 'background.default',
                          color: theme.palette.text.secondary,
                          borderRadius: 1,
                        }}
                      />
                      {item.unitSnapshot && (
                        <Typography variant="caption" color="text.secondary">
                          Unit: {item.unitSnapshot}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {formatQuantity(item.originalQuantity)} {item.unitSnapshot}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${formatQuantity(item.returnQuantity)} ${item.unitSnapshot || ''}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: '#991b1b',
                        borderRadius: 1.5,
                        border: '1px solid #fecaca',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formatCurrency(item.rate)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: item.discountAmount > 0 ? 'error.main' : 'text.secondary' }}>
                    {item.discountAmount > 0 ? `- ${formatCurrency(item.discountAmount)}` : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={750} color={theme.palette.text.primary}>
                      {formatCurrency(item.lineTotal)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Financials & Reason Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Reason / Notes */}
        <Grid size={{ xs: 12, md: 7 }}>
          <DetailCard
            title="Return Reasons & Memos"
            subtitle="Reason for return and transaction notes"
            icon={<NotesOutlinedIcon />}
            color="indigo"
          >
            <Stack spacing={1.5}>
              <DetailRow
                label="Reason for Return"
                value={ret.reason || 'No specific reason specified'}
                isBold
              />
              <DetailRow
                label="Adjustment / Refund Mode"
                value={ret.refundMode ? ret.refundMode.replace('_', ' ') : 'CREDIT ADJUSTMENT'}
              />
              {ret.notes && (
                <DetailRow
                  label="Remarks & Notes"
                  value={ret.notes}
                  divider={false}
                />
              )}
            </Stack>
          </DetailCard>
        </Grid>

        {/* Financial Summary */}
        <Grid size={{ xs: 12, md: 5 }}>
          <DetailCard
            title="Debit Note Summary"
            subtitle="Subtotals, discounts and ledger adjustment"
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="error"
          >
            <Stack spacing={1.2}>
              <DetailRow
                label="Gross Items Subtotal"
                value={formatCurrency(ret.subtotal)}
              />

              {ret.itemDiscount > 0 && (
                <DetailRow
                  label="Item Discounts"
                  value={`- ${formatCurrency(ret.itemDiscount)}`}
                  valueColor="error.main"
                />
              )}

              {ret.overallDiscountAllocated > 0 && (
                <DetailRow
                  label="Overall Allocated Discount"
                  value={`- ${formatCurrency(ret.overallDiscountAllocated)}`}
                  valueColor="error.main"
                />
              )}

              {/* Total Callout Banner */}
              <Box
                sx={{
                  my: 1,
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
                  <Typography variant="caption" sx={{ color: theme.palette.error.dark, fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Debit Amount
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.error.dark, fontSize: '0.75rem' }}>
                    Debit Note Value
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.error.dark, letterSpacing: '-0.02em' }}>
                  {formatCurrency(ret.returnAmount)}
                </Typography>
              </Box>

              {ret.refundAmount > 0 && (
                <DetailRow
                  label="Cash / Bank Refunded"
                  value={formatCurrency(ret.refundAmount)}
                  valueColor="success.main"
                />
              )}

              {ret.adjustmentAmount > 0 && (
                <DetailRow
                  label="Payable Balance Reduced"
                  value={formatCurrency(ret.adjustmentAmount)}
                  valueColor="primary.main"
                  divider={false}
                />
              )}
            </Stack>
          </DetailCard>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialog}
        title="Cancel Purchase Return"
        message={`Are you sure you want to cancel ${ret.returnNumber}? This will restore the returned stock to your inventory and undo the debit adjustment. This action cannot be undone.`}
        confirmText={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        onConfirm={handleCancelReturn}
        onCancel={() => setCancelDialog(false)}
        severity="error"
        loading={cancelling}
      />
      </Box>
      <PurchaseReturnPrintView ret={ret} />
    </Box>
  );
}
