import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Typography,
  Stack,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
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
import SalesReturnPrintView from '../../components/salesReturn/SalesReturnPrintView';
import salesReturnService from '../../services/salesReturnService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const SalesReturnDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ret, setRet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await salesReturnService.getSalesReturnById(id);
      if (res?.success) setRet(res.data);
    } catch {
      toast.error('Failed to load return details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handlePrint = () => window.print();

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await salesReturnService.downloadSalesReturnPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ret?.returnNumber || 'SalesReturn'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Sales Return PDF downloaded');
    } catch {
      toast.error('Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await salesReturnService.cancelSalesReturn(id);
      if (res?.success) {
        toast.success(`Return ${res.data.returnNumber} cancelled.`);
        setRet(res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel return.');
    } finally {
      setCancelling(false);
      setCancelDialog(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Sales Return Details" description="Loading transaction data..." />
        <Card sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <TableSkeleton rows={8} columns={5} />
        </Card>
      </Box>
    );
  }

  if (!ret) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Sales Return Details" />
        <Alert severity="error" sx={{ borderRadius: 2 }}>Return record not found.</Alert>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{ mt: 2 }}
          onClick={() => navigate('/sales/returns')}
        >
          Back to Sales Returns
        </Button>
      </Box>
    );
  }

  const isCancelled = ret.status === 'CANCELLED';

  return (
    <Box>
      <Box className="no-print" sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Top Header */}
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <span>{ret.returnNumber}</span>
            <StatusChip status={ret.status} />
          </Stack>
        }
        subtitle={`Sales return against invoice ${ret.invoiceNumber || 'N/A'}`}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ '@media print': { display: 'none' } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate('/sales/returns')}
              sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={pdfLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlinedIcon />}
              onClick={handlePdf}
              disabled={pdfLoading}
            >
              Download PDF
            </Button>

            <Tooltip title="Print Document">
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
                Cancel Return
              </Button>
            )}
          </Stack>
        }
      />

      {isCancelled && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #fecaca' }}>
          This sales return has been cancelled. All inventory stock returns have been reversed and restored to original balances.
        </Alert>
      )}

      {/* Top Executive KPI Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Return Number"
            value={ret.returnNumber}
            subtitle="Credit / Return Voucher"
            icon={<AssignmentReturnOutlinedIcon />}
            color="primary"
            badge={<StatusChip status={ret.status} size="small" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Original Invoice"
            value={
              <Box
                component="span"
                onClick={() => ret.saleId && navigate(`/sales/${ret.saleId}`)}
                sx={{
                  color: 'primary.main',
                  cursor: ret.saleId ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { textDecoration: ret.saleId ? 'underline' : 'none' },
                }}
              >
                {ret.invoiceNumber || 'N/A'}
                {ret.saleId && <LaunchOutlinedIcon sx={{ fontSize: 15 }} />}
              </Box>
            }
            subtitle={ret.saleDate ? `Dated: ${formatDate(ret.saleDate)}` : 'Original Sale'}
            icon={<ReceiptOutlinedIcon />}
            color="indigo"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DetailKPICard
            title="Total Return Value"
            value={formatCurrency(ret.returnAmount || 0)}
            subtitle={`Refund Mode: ${ret.refundMode ? ret.refundMode.replace('_', ' ') : 'N/A'}`}
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="warning"
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

      {/* Customer Information & Financial Summary in Balanced Responsive Columns */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Customer Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Customer Information"
            subtitle="Primary party & contact details"
            icon={<PersonOutlineOutlinedIcon />}
            color="primary"
            headerAction={
              ret.partyCode && (
                <Chip
                  icon={<BadgeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                  label={ret.partyCode}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: 'primary.dark',
                    border: '1px solid #bfdbfe',
                  }}
                />
              )
            }
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Customer Name"
                value={ret.partyName}
                icon={<PersonOutlineOutlinedIcon />}
                isBold
              />
              <DetailRow
                label="Customer Code"
                value={ret.partyCode}
                icon={<BadgeOutlinedIcon />}
                copyable
              />
              <DetailRow
                label="Mobile Phone"
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
                label="Billing Address"
                value={[ret.partyAddress, ret.partyCity, ret.partyState].filter(Boolean).join(', ')}
                icon={<PlaceOutlinedIcon />}
                divider={false}
              />
            </Stack>
          </DetailCard>
        </Grid>

        {/* Financial Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard
            title="Financial Summary"
            subtitle="Valuation, discounts and refund distribution"
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="warning"
          >
            <Stack spacing={0.3}>
              <DetailRow
                label="Gross Items Subtotal"
                value={formatCurrency(ret.subtotal || 0)}
              />
              {Number(ret.itemDiscount || 0) > 0 && (
                <DetailRow
                  label="Item Level Discounts"
                  value={`- ${formatCurrency(ret.itemDiscount)}`}
                  valueColor="error.main"
                />
              )}
              {Number(ret.overallDiscountAllocated || 0) > 0 && (
                <DetailRow
                  label="Allocated Invoice Discount"
                  value={`- ${formatCurrency(ret.overallDiscountAllocated)}`}
                  valueColor="error.main"
                />
              )}
              {Number(ret.totalDiscount || 0) > 0 && (
                <DetailRow
                  label="Total Discount Deducted"
                  value={`- ${formatCurrency(ret.totalDiscount)}`}
                  valueColor="error.main"
                  isBold
                />
              )}

              {/* Total Return Callout Banner */}
              <Box
                sx={{
                  my: 1.5,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.warning.dark, fontWeight: 700, textTransform: 'uppercase' }}>
                    Net Return Amount
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.warning.dark, fontSize: '0.75rem' }}>
                    Mode: {ret.refundMode ? ret.refundMode.replace('_', ' ') : 'CASH'}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.warning.dark, letterSpacing: '-0.02em' }}>
                  {formatCurrency(ret.returnAmount || 0)}
                </Typography>
              </Box>

              {Number(ret.refundAmount || 0) > 0 && (
                <DetailRow
                  label="Cash / Bank Refund Disbursed"
                  value={formatCurrency(ret.refundAmount)}
                  valueColor="success.main"
                />
              )}
              {Number(ret.adjustmentAmount || 0) > 0 && (
                <DetailRow
                  label="Customer Ledger Credit Adj."
                  value={formatCurrency(ret.adjustmentAmount)}
                  valueColor="primary.main"
                />
              )}
              {ret.reason && (
                <DetailRow
                  label="Return Reason"
                  value={ret.reason}
                  icon={<NotesOutlinedIcon />}
                  divider={false}
                />
              )}
            </Stack>
          </DetailCard>
        </Grid>
      </Grid>

      {/* Returned Items Table */}
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
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: theme.palette.info.main,
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary} fontSize="0.925rem">
                Returned Items & Stock Reversal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(ret.items || []).length} items returned to warehouse inventory
              </Typography>
            </Box>
          </Stack>
        </Box>

        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Orig. Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Return Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Rate</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Discount</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Line Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(ret.items || []).map((item, idx) => (
                <TableRow key={item.id || idx} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{idx + 1}</TableCell>
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
                    {Number(item.originalQuantity || 0).toFixed(3)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${Number(item.returnQuantity || 0).toFixed(3)} ${item.unitSnapshot || ''}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.dark,
                        borderRadius: 1.5,
                        border: '1px solid #fde68a',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formatCurrency(item.rate)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: Number(item.discountAmount) > 0 ? 'error.main' : 'text.secondary' }}>
                    {Number(item.discountAmount) > 0 ? `- ${formatCurrency(item.discountAmount)}` : '—'}
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

        {/* Table Footer Total */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: 'background.default',
            borderTop: 1, borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Stack spacing={0.5} sx={{ minWidth: 260 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Items Subtotal:</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(ret.subtotal || 0)}</Typography>
            </Stack>
            {Number(ret.totalDiscount || 0) > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="error.main">Total Discounts:</Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  - {formatCurrency(ret.totalDiscount)}
                </Typography>
              </Stack>
            )}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary}>Total Return:</Typography>
              <Typography variant="h6" fontWeight={800} color="warning.dark">
                {formatCurrency(ret.returnAmount || 0)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Card>

      {/* Notes & Remarks */}
      {ret.notes && (
        <DetailCard
          title="Notes & Remarks"
          icon={<NotesOutlinedIcon />}
          color="secondary"
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', lineHeight: 1.6 }}>
            "{ret.notes}"
          </Typography>
        </DetailCard>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialog}
        title="Cancel Sales Return"
        message={`Are you sure you want to cancel sales return ${ret.returnNumber}? This will reverse the stock increase and restore customer balance. This action cannot be undone.`}
        confirmText={cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
        severity="error"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog(false)}
      />
      </Box>
      <SalesReturnPrintView ret={ret} />
    </Box>
  );
};

export default SalesReturnDetails;
