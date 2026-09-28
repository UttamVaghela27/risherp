import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Grid, Typography, TextField, MenuItem, Button, Stack,
  CircularProgress, Divider, Alert, alpha,
} from '@mui/material';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import SaleInvoiceSelector from '../../components/salesReturn/SaleInvoiceSelector';
import OriginalSalePreview from '../../components/salesReturn/OriginalSalePreview';
import ReturnableItemsTable from '../../components/salesReturn/ReturnableItemsTable';
import salesReturnService from '../../services/salesReturnService';

const REFUND_MODES = [
  { value: 'CREDIT_ADJUSTMENT', label: 'Credit Adjustment (Reduce Outstanding)' },
  { value: 'CASH', label: 'Cash Refund' },
  { value: 'BANK', label: 'Bank Transfer' },
];

const SalesReturnCreate = ({ isModal = false, onClose, onSuccess } = {}) => {
  const navigate = useNavigate();

  // State
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnableItems, setReturnableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Item selection state: { [saleItemId]: { selected, returnQty, error } }
  const [selectedItems, setSelectedItems] = useState({});

  // Form fields
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [refundMode, setRefundMode] = useState('CREDIT_ADJUSTMENT');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Load returnable items when sale is selected
  useEffect(() => {
    if (!selectedSale) { setReturnableItems([]); setSelectedItems({}); return; }
    const load = async () => {
      setLoadingItems(true);
      try {
        const res = await salesReturnService.getReturnableItems(selectedSale.id);
        if (res?.success) {
          setReturnableItems(res.data || []);
          setSelectedItems({});
        }
      } catch { toast.error('Failed to load returnable items.'); }
      finally { setLoadingItems(false); }
    };
    load();
  }, [selectedSale]);

  const handleSaleSelected = (sale) => {
    setSelectedSale(sale);
    setFormError('');
  };

  const handleClearSale = () => {
    setSelectedSale(null);
    setReturnableItems([]);
    setSelectedItems({});
    setFormError('');
  };

  const handleToggleItem = (saleItemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [saleItemId]: {
        selected: !prev[saleItemId]?.selected,
        returnQty: prev[saleItemId]?.returnQty || '',
        error: '',
      },
    }));
  };

  const handleQtyChange = (saleItemId, value) => {
    const item = returnableItems.find((i) => i.saleItemId === saleItemId);
    let error = '';
    const numVal = parseFloat(value);
    if (value === '' || isNaN(numVal)) {
      error = 'Required';
    } else if (numVal <= 0) {
      error = 'Must be > 0';
    } else if (item && numVal > Number(item.returnableQuantity)) {
      error = `Max: ${Number(item.returnableQuantity).toFixed(3)}`;
    }
    setSelectedItems((prev) => ({
      ...prev,
      [saleItemId]: { ...prev[saleItemId], returnQty: value, error },
    }));
  };

  // Preview return amount calculation (informational only — backend recalculates)
  const previewReturnAmount = returnableItems.reduce((sum, item) => {
    const sel = selectedItems[item.saleItemId];
    if (!sel?.selected || !sel.returnQty || isNaN(Number(sel.returnQty))) return sum;
    const qty = Number(sel.returnQty);
    const origQty = Number(item.originalQuantity);
    const lineTotal = Number(item.lineTotal);
    if (origQty > 0) return sum + (qty / origQty) * lineTotal;
    return sum;
  }, 0);

  const handleSubmit = async () => {
    setFormError('');

    // Validate at least one item selected
    const selected = Object.entries(selectedItems).filter(([, v]) => v.selected);
    if (selected.length === 0) { setFormError('Please select at least one item to return.'); return; }

    // Validate all selected qty fields
    let hasError = false;
    for (const [saleItemId, sel] of selected) {
      if (!sel.returnQty || isNaN(Number(sel.returnQty)) || Number(sel.returnQty) <= 0) {
        setSelectedItems((prev) => ({ ...prev, [saleItemId]: { ...sel, error: 'Enter valid quantity' } }));
        hasError = true;
      }
    }
    if (hasError) { setFormError('Fix quantity errors before submitting.'); return; }
    if (!returnDate) { setFormError('Return date is required.'); return; }

    const items = selected.map(([saleItemId, sel]) => ({
      saleItemId: Number(saleItemId),
      returnQuantity: parseFloat(Number(sel.returnQty).toFixed(3)),
    }));

    const payload = {
      saleId: selectedSale.id,
      returnDate,
      items,
      refundMode,
      reason: reason.trim() || null,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await salesReturnService.createSalesReturn(payload);
      if (res?.success) {
        toast.success(`Sales return ${res.data.returnNumber} created successfully!`);
        if (isModal) {
          if (onSuccess) onSuccess(res.data);
          if (onClose) onClose();
        } else {
          navigate(`/sales/returns/${res.data.id}`);
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create sales return.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: isModal ? 0 : 0 }}>
      {!isModal && (
        <PageHeader
          title="Create Sales Return"
          description="Process a return against an existing sale invoice."
          breadcrumbs={[
            { label: 'Sales', href: '/sales' },
            { label: 'Sales Returns', href: '/sales/returns' },
            { label: 'New Return', active: true },
          ]}
        />
      )}

      {/* Step 1: Invoice Search */}
      {!selectedSale && <SaleInvoiceSelector onSaleSelected={handleSaleSelected} />}

      {/* Step 2: Invoice Preview */}
      {selectedSale && (
        <OriginalSalePreview sale={selectedSale} onClear={handleClearSale} />
      )}

      {/* Step 3: Returnable Items */}
      {selectedSale && (
        <>
          {loadingItems ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading returnable items…
              </Typography>
            </Box>
          ) : (
            <ReturnableItemsTable
              items={returnableItems}
              selectedItems={selectedItems}
              onToggle={handleToggleItem}
              onQtyChange={handleQtyChange}
            />
          )}

          {/* Step 4: Return Details */}
          {!loadingItems && returnableItems.length > 0 && (
            <Card sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Step 4 — Return Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Return Date"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Refund Mode"
                    value={refundMode}
                    onChange={(e) => setRefundMode(e.target.value)}
                  >
                    {REFUND_MODES.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Reason (optional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    inputProps={{ maxLength: 1000 }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              {/* Return Amount Preview */}
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ESTIMATED RETURN AMOUNT</Typography>
                  <Typography variant="h5" fontWeight={800} color="warning.dark">
                    ₹ {previewReturnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    * Final amount calculated by server
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    onClick={isModal ? onClose : () => navigate('/sales/returns')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
                    sx={{ minWidth: 180 }}
                  >
                    {submitting ? 'Processing…' : 'Create Sales Return'}
                  </Button>
                </Stack>
              </Stack>

              {formError && (
                <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>
              )}
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default SalesReturnCreate;
