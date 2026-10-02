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




import partyService from '../../services/partyService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ReceiptCreate({ isModal = false, onClose, onSuccess } = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  // Parties (Customers)
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Outstanding sales
  const [outstandingSales, setOutstandingSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // Form
  const [receiptDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Allocations state: { [saleId]: amount }
  const [allocations, setAllocations] = useState({});

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await partyService.getParties({ size: 200, status: 'ACTIVE' });
        const list = res.data?.content || res.content || [];
        const filtered = list.filter((p) => p.partyType === 'CUSTOMER' || p.partyType === 'BOTH');
        setCustomers(filtered);
      } catch {
        toast.error('Failed to load customers');
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  const handleCustomerChange = async (partyId) => {
    setSelectedCustomerId(partyId);
    setAllocations({});
    if (!partyId) {
      setOutstandingSales([]);
      return;
    }

    setLoadingSales(true);
    try {
      const res = await receiptService.getOutstandingSales(partyId);
      setOutstandingSales(res.data || res || []);
    } catch {
      toast.error('Failed to load customer outstanding invoices');
    } finally {
      setLoadingSales(false);
    }
  };

  const handleAllocationChange = (saleId, val, maxLimit) => {
    setAllocations((prev) => ({
      ...prev,
      [saleId]: val,
    }));
  };

  const handleAllocateFull = (saleId, maxLimit) => {
    setAllocations((prev) => ({
      ...prev,
      [saleId]: String(maxLimit),
    }));
  };

  // Live financials
  const numReceiptAmount = parseFloat(amount) || 0;

  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => {
      const n = parseFloat(val) || 0;
      return sum + (n > 0 ? n : 0);
    }, 0);
  }, [allocations]);

  const unallocatedAmount = Math.max(0, numReceiptAmount - totalAllocated);
  const isOverAllocated = totalAllocated > numReceiptAmount;

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!selectedCustomerId) {
      toast.error('Please select a customer.');
      return;
    }

    if (numReceiptAmount <= 0) {
      toast.error('Please enter a valid receipt amount greater than zero.');
      return;
    }

    if (isOverAllocated) {
      toast.error(`Total allocated amount (₹${totalAllocated}) cannot exceed receipt amount (₹${numReceiptAmount}).`);
      return;
    }

    // Build allocation payload
    const allocationPayload = [];
    for (const [saleId, allocVal] of Object.entries(allocations)) {
      const n = parseFloat(allocVal);
      if (n > 0) {
        const sale = outstandingSales.find((s) => String(s.saleId) === String(saleId));
        if (sale && n > sale.balanceAmount) {
          toast.error(`Allocation for ${sale.invoiceNumber} exceeds outstanding balance of ₹${sale.balanceAmount}.`);
          return;
        }
        allocationPayload.push({
          saleId: Number(saleId),
          allocatedAmount: n,
        });
      }
    }

    const payload = {
      partyId: Number(selectedCustomerId),
      receiptDate,
      amount: numReceiptAmount,
      paymentMode,
      referenceNumber: referenceNumber.trim() || null,
      allocations: allocationPayload,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await receiptService.createReceipt(payload);
      const created = res.data || res;
      toast.success(`Receipt ${created.receiptNumber} recorded successfully!`);
      if (isModal) {
        if (onSuccess) onSuccess(created);
        if (onClose) onClose();
      } else {
        navigate(`/receipts/${created.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record receipt.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: isModal ? 0 : 3 }}>
      {!isModal && (
        <PageHeader
          title="Record Customer Receipt"
          subtitle="Collect payment from customer, settle outstanding invoices, or record customer advance"
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/receipts')}
            >
              Back to Receipts
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
                Receipt Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Enter the collected payment amount, payment mode, and select the customer to generate receipt voucher.
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                }}
              >
                {/* Customer Dropdown - Full Width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    select
                    fullWidth
                    required
                    size="small"
                    label="Select Customer"
                    value={selectedCustomerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    disabled={submitting || loadingCustomers}
                  >
                    <MenuItem value="">-- Select Customer --</MenuItem>
                    {customers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.partyName} ({c.partyCode}) {c.mobile ? `— ${c.mobile}` : ''}
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
                  label="Receipt Date"
                  value={receiptDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputLabelProps={{ shrink: true }}
                  disabled={submitting}
                />

                {/* Amount */}
                <TextField
                  type="number"
                  fullWidth
                  required
                  size="small"
                  label="Amount Received (₹)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputProps={{ min: 0.01, step: 'any' }}
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
                  placeholder="e.g. UTR / UPI Ref / Cheque No."
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
                    placeholder="Optional notes or memos regarding this receipt..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitting}
                  />
                </Box>
              </Box>
            </Card>

            {/* Outstanding Sales Allocation Table */}
            {selectedCustomerId && (
              <Card
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: 1, borderColor: 'divider',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
                  Invoice Settlement Allocation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Allocate receipt amount against outstanding invoices or leave as customer advance credit.
                </Typography>

                {loadingSales ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : outstandingSales.length > 0 ? (
                  <TableContainer sx={{ borderRadius: '12px', border: 1, borderColor: 'divider' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Invoice #</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Grand Total</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Balance Due</TableCell>
                          <TableCell align="center" sx={{ width: 140, fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Allocate (₹)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {outstandingSales.map((sale) => {
                          const allocVal = allocations[sale.saleId] || '';
                          const numAlloc = parseFloat(allocVal) || 0;
                          const isInvalid = numAlloc > sale.balanceAmount;

                          return (
                            <TableRow key={sale.saleId} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                  {sale.invoiceNumber}
                                </Typography>
                                <StatusChip status={sale.paymentStatus} size="small" />
                              </TableCell>
                              <TableCell>{formatDate(sale.saleDate)}</TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(sale.grandTotal)}</TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'warning.dark' }}>
                                  {formatCurrency(sale.balanceAmount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  type="number"
                                  size="small"
                                  value={allocVal}
                                  onChange={(e) => handleAllocationChange(sale.saleId, e.target.value, sale.balanceAmount)}
                                  inputProps={{ min: 0, max: sale.balanceAmount, step: 'any', style: { textAlign: 'right' } }}
                                  error={isInvalid}
                                  helperText={isInvalid ? `Max: ₹${sale.balanceAmount}` : ''}
                                  disabled={submitting}
                                  sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Pay Full Balance">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleAllocateFull(sale.saleId, sale.balanceAmount)}
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
                    This customer has no pending unpaid invoices. The entire amount will be stored as customer advance credit.
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
                Real-time invoice settlement and customer advance calculations.
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                {/* Total Receipt Amount Box */}
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
                  <Box>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Receipt
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: 'success.main', mt: 0.2 }}>
                      {formatCurrency(numReceiptAmount)}
                    </Typography>
                  </Box>
                  <Chip label={paymentMode} size="small" sx={{ bgcolor: 'background.paper', color: 'success.main', fontWeight: 700, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.3) }} />
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
                    Allocated to Invoices
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
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Customer Advance / Credit
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                    {formatCurrency(unallocatedAmount)}
                  </Typography>
                </Box>

                {isOverAllocated && (
                  <Alert severity="error" sx={{ borderRadius: '10px' }}>
                    Allocated amount exceeds receipt total by {formatCurrency(totalAllocated - numReceiptAmount)}.
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
                  disabled={submitting || !selectedCustomerId || numReceiptAmount <= 0 || isOverAllocated}
                  sx={{
                    height: 48,
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {submitting ? 'Recording Receipt...' : 'Save & Confirm Receipt'}
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
