import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Grid, Typography, TextField, MenuItem, Button,
  Stack, Divider, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert,
  Chip, useTheme, alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DoneAllIcon from '@mui/icons-material/DoneAll';




import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { paymentTxnService } from '../../services/paymentTxnService';
import partyService from '../../services/partyService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function PaymentCreate({ isModal = false, onClose, onSuccess }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  // Parties (Suppliers)
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  // Outstanding purchases
  const [outstandingPurchases, setOutstandingPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // Form
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Allocations state: { [purchaseId]: amount }
  const [allocations, setAllocations] = useState({});

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await partyService.getParties({ size: 200, status: 'ACTIVE' });
        const list = res.data?.content || res.content || [];
        const filtered = list.filter((p) => p.partyType === 'SUPPLIER' || p.partyType === 'BOTH');
        setSuppliers(filtered);
      } catch {
        toast.error('Failed to load suppliers');
      } finally {
        setLoadingSuppliers(false);
      }
    };
    loadSuppliers();
  }, []);

  const handleSupplierChange = async (partyId) => {
    setSelectedSupplierId(partyId);
    setAllocations({});
    if (!partyId) {
      setOutstandingPurchases([]);
      return;
    }

    setLoadingPurchases(true);
    try {
      const res = await paymentTxnService.getOutstandingPurchases(partyId);
      const list = res?.data || res || [];
      setOutstandingPurchases(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load supplier outstanding purchases:', err);
      setOutstandingPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleAllocationChange = (purchaseId, val, maxLimit) => {
    setAllocations((prev) => ({
      ...prev,
      [purchaseId]: val,
    }));
  };

  const handleAllocateFull = (purchaseId, maxLimit) => {
    setAllocations((prev) => ({
      ...prev,
      [purchaseId]: String(maxLimit),
    }));
  };

  // Live financials
  const numPaymentAmount = parseFloat(amount) || 0;

  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => {
      const n = parseFloat(val) || 0;
      return sum + (n > 0 ? n : 0);
    }, 0);
  }, [allocations]);

  const unallocatedAmount = Math.max(0, numPaymentAmount - totalAllocated);
  const isOverAllocated = totalAllocated > numPaymentAmount;

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!selectedSupplierId) {
      toast.error('Please select a supplier.');
      return;
    }

    if (numPaymentAmount <= 0) {
      toast.error('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (isOverAllocated) {
      toast.error(`Total allocated amount (₹${totalAllocated}) cannot exceed payment amount (₹${numPaymentAmount}).`);
      return;
    }

    // Build allocation payload
    const allocationPayload = [];
    for (const [purchaseId, allocVal] of Object.entries(allocations)) {
      const n = parseFloat(allocVal);
      if (n > 0) {
        const purchase = outstandingPurchases.find((p) => String(p.purchaseId) === String(purchaseId));
        if (purchase && n > purchase.balanceAmount) {
          toast.error(`Allocation for ${purchase.purchaseNumber} exceeds outstanding balance of ₹${purchase.balanceAmount}.`);
          return;
        }
        allocationPayload.push({
          purchaseId: Number(purchaseId),
          allocatedAmount: n,
        });
      }
    }

    const payload = {
      partyId: Number(selectedSupplierId),
      paymentDate,
      amount: numPaymentAmount,
      paymentMode,
      referenceNumber: referenceNumber.trim() || null,
      allocations: allocationPayload,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await paymentTxnService.createPayment(payload);
      const created = res.data || res;
      toast.success(`Payment ${created.paymentNumber} recorded successfully!`);
      if (isModal) {
        if (onSuccess) onSuccess(created);
        if (onClose) onClose();
      } else {
        navigate(`/payments/${created.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record payment.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: isModal ? 0 : 3 }}>
      {!isModal && (
        <PageHeader
          title="Record Supplier Payment"
          subtitle="Disburse payment to vendor, settle outstanding purchases, or record supplier advance"
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/payments')}
            >
              Back to Payments
            </Button>
          }
        />
      )}

      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* Main Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                border: 1, borderColor: 'divider',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                '& .MuiOutlinedInput-root': { borderRadius: '10px' },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
                Payment Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Enter the payment amount, transaction mode, and select the supplier to record voucher.
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                }}
              >
                {/* Supplier Dropdown - Full Width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    select
                    fullWidth
                    required
                    size="small"
                    label="Select Supplier"
                    value={selectedSupplierId}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    disabled={submitting || loadingSuppliers}
                  >
                    <MenuItem value="">-- Select Supplier --</MenuItem>
                    {suppliers.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.partyName} ({s.partyCode}) {s.mobile ? `— ${s.mobile}` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Date */}
                <TextField
                  type="date"
                  fullWidth
                  required
                  size="small"
                  label="Payment Date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputLabelProps={{ shrink: true }}
                  disabled={submitting}
                />

                {/* Amount */}
                <TextField
                  type="text"
                  fullWidth
                  required
                  size="small"
                  label="Amount Paid (₹)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputProps={{ inputMode: 'decimal',  min: 0.01, step: 'any' }}
                  disabled={submitting}
                />

                {/* Mode */}
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  label="Payment Mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer / NEFT</MenuItem>
                  <MenuItem value="UPI">UPI / QR</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>

                {/* Ref # */}
                <TextField
                  fullWidth
                  size="small"
                  label="Reference / Transaction No."
                  placeholder="e.g. UTR / Cheque No."
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  disabled={submitting}
                />

                {/* Notes - Full Width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Notes / Remarks"
                    placeholder="Optional notes or memos regarding this payment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitting}
                  />
                </Box>
              </Box>
            </Card>

            {/* Outstanding Purchases Allocation Table */}
            {selectedSupplierId && (
              <Card
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: 1, borderColor: 'divider',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
                  Purchase Settlement Allocation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Allocate payment amount against outstanding purchase invoices or leave as supplier advance debit.
                </Typography>

                {loadingPurchases ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : outstandingPurchases.length > 0 ? (
                  <TableContainer sx={{ borderRadius: '12px', border: 1, borderColor: 'divider' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Purchase #</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Grand Total</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Balance Due</TableCell>
                          <TableCell align="center" sx={{ width: 140, fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Allocate (₹)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {outstandingPurchases.map((purchase) => {
                          const allocVal = allocations[purchase.purchaseId] || '';
                          const numAlloc = parseFloat(allocVal) || 0;
                          const isInvalid = numAlloc > purchase.balanceAmount;

                          return (
                            <TableRow key={purchase.purchaseId} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                  {purchase.purchaseNumber}
                                </Typography>
                                <StatusChip status={purchase.paymentStatus} size="small" />
                              </TableCell>
                              <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(purchase.grandTotal)}</TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'warning.dark' }}>
                                  {formatCurrency(purchase.balanceAmount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  type="text"
                                  size="small"
                                  value={allocVal}
                                  onChange={(e) => handleAllocationChange(purchase.purchaseId, e.target.value, purchase.balanceAmount)}
                                  inputProps={{ inputMode: 'decimal',  min: 0, max: purchase.balanceAmount, step: 'any', style: { textAlign: 'right' } }}
                                  error={isInvalid}
                                  helperText={isInvalid ? `Max: ₹${purchase.balanceAmount}` : ''}
                                  disabled={submitting}
                                  sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Pay Full Balance">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleAllocateFull(purchase.purchaseId, purchase.balanceAmount)}
                                    disabled={submitting}
                                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) } }}
                                  >
                                    <DoneAllIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    This supplier has no pending unpaid purchase invoices. The entire amount will be stored as supplier advance debit.
                  </Alert>
                )}
              </Card>
            )}
          </Box>

          {/* Financial Summary & Action */}
          <Box sx={{ position: { lg: 'sticky' }, top: 88 }}>
            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                border: 1, borderColor: 'divider',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
                Settlement Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Real-time invoice settlement and advance calculations.
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                {/* Total Payment Amount Box */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.3),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Payment
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: 'error.main', mt: 0.2 }}>
                      {formatCurrency(numPaymentAmount)}
                    </Typography>
                  </Box>
                  <Chip label={paymentMode} size="small" sx={{ bgcolor: 'background.paper', color: 'error.main', fontWeight: 700, border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.3) }} />
                </Box>

                {/* Allocated row */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'background.default',
                    border: 1, borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Allocated to Purchases
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                    {formatCurrency(totalAllocated)}
                  </Typography>
                </Box>

                {/* Advance row */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.success.main, 0.3),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Supplier Advance / Debit
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                    {formatCurrency(unallocatedAmount)}
                  </Typography>
                </Box>

                {isOverAllocated && (
                  <Alert severity="error" sx={{ borderRadius: '10px' }}>
                    Allocated amount exceeds payment total by {formatCurrency(totalAllocated - numPaymentAmount)}.
                  </Alert>
                )}

                <Divider sx={{ my: 1 }} />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={submitting || !selectedSupplierId || numPaymentAmount <= 0 || isOverAllocated}
                  sx={{
                    height: 48,
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {submitting ? 'Recording Payment...' : 'Save & Confirm Payment'}
                </Button>

                {isModal && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={onClose}
                    disabled={submitting}
                    sx={{ borderRadius: '10px' }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Card>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
