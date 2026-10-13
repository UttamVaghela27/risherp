import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Grid, Typography, TextField, MenuItem, Button,
  Stack, Divider, CircularProgress, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import PageHeader from '../../components/common/PageHeader';
import PurchaseSelector from '../../components/purchaseReturn/PurchaseSelector';
import OriginalPurchasePreview from '../../components/purchaseReturn/OriginalPurchasePreview';
import ReturnablePurchaseItemsTable from '../../components/purchaseReturn/ReturnablePurchaseItemsTable';
import purchaseReturnService from '../../services/purchaseReturnService';
import toast from 'react-hot-toast';

const REASON_PRESETS = [
  'Defective / Damaged goods',
  'Incorrect specifications / Wrong item delivered',
  'Quality below standard',
  'Excess shipment received',
  'Expired product / Short expiry date',
  'Order cancelled with vendor',
  'Other',
];

export default function PurchaseReturnCreate({ isModal = false, onClose, onSuccess } = {}) {
  const navigate = useNavigate();

  // Selected original purchase
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [returnableItems, setReturnableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Return selections: { [purchaseItemId]: { returnQuantity: 1 } }
  const [selectedItems, setSelectedItems] = useState({});

  // Form fields
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [refundMode, setRefundMode] = useState('CREDIT_ADJUSTMENT');
  const [reasonPreset, setReasonPreset] = useState(REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // When purchase is chosen, load returnable quantities
  const handlePurchaseSelected = async (purchase) => {
    setSelectedPurchase(purchase);
    setSelectedItems({});
    setLoadingItems(true);
    try {
      const res = await purchaseReturnService.getReturnableItems(purchase.id);
      const items = res.data || res;
      setReturnableItems(items || []);
    } catch {
      toast.error('Failed to load returnable items for this purchase');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleToggleItem = (item, checked) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (checked) {
        next[item.purchaseItemId] = {
          returnQuantity: item.returnableQuantity || 1,
        };
      } else {
        delete next[item.purchaseItemId];
      }
      return next;
    });
  };

  const handleQuantityChange = (purchaseItemId, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [purchaseItemId]: {
        ...prev[purchaseItemId],
        returnQuantity: value,
      },
    }));
  };

  // Live estimated financials
  const estimatedSummary = useMemo(() => {
    if (!selectedPurchase) return null;

    let subtotal = 0;
    let itemDiscount = 0;

    returnableItems.forEach((item) => {
      const sel = selectedItems[item.purchaseItemId];
      if (sel) {
        const qty = parseFloat(sel.returnQuantity) || 0;
        if (qty > 0 && item.originalQuantity > 0) {
          const prop = qty / item.originalQuantity;
          const lineTotal = item.lineTotal * prop;
          subtotal += lineTotal;
          if (item.discountAmount) {
            itemDiscount += item.discountAmount * prop;
          }
        }
      }
    });

    let overallDiscountAllocated = 0;
    if (selectedPurchase.overallDiscount > 0 && selectedPurchase.subtotal > 0) {
      const weight = subtotal / selectedPurchase.subtotal;
      overallDiscountAllocated = selectedPurchase.overallDiscount * weight;
    }

    const returnAmount = Math.max(0, subtotal - overallDiscountAllocated);

    return {
      subtotal,
      itemDiscount,
      overallDiscountAllocated,
      returnAmount,
    };
  }, [selectedPurchase, returnableItems, selectedItems]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormError('');

    if (!selectedPurchase) {
      toast.error('Please select an original purchase first.');
      return;
    }

    const selectedKeys = Object.keys(selectedItems);
    if (selectedKeys.length === 0) {
      const msg = 'Please select at least one item to return.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    // Build payload items
    const itemsPayload = [];
    for (const pItemId of selectedKeys) {
      const sel = selectedItems[pItemId];
      const qty = parseFloat(sel.returnQuantity);
      if (isNaN(qty) || qty <= 0) {
        const msg = 'Please enter a valid return quantity (> 0) for all selected items.';
        setFormError(msg);
        toast.error(msg);
        return;
      }
      const originalItem = returnableItems.find((i) => String(i.purchaseItemId) === String(pItemId));
      if (originalItem && qty > originalItem.returnableQuantity) {
        const msg = `Return quantity for ${originalItem.itemNameSnapshot} exceeds returnable quantity (${originalItem.returnableQuantity}).`;
        setFormError(msg);
        toast.error(msg);
        return;
      }
      itemsPayload.push({
        purchaseItemId: Number(pItemId),
        returnQuantity: qty,
      });
    }

    const finalReason = reasonPreset === 'Other' ? customReason : reasonPreset;

    const payload = {
      purchaseId: selectedPurchase.id,
      returnDate,
      items: itemsPayload,
      refundMode,
      reason: finalReason,
      notes,
    };

    setSubmitting(true);
    try {
      const res = await purchaseReturnService.createPurchaseReturn(payload);
      const created = res.data || res;
      toast.success(`Purchase Return ${created.returnNumber} created successfully!`);
      if (isModal) {
        if (onSuccess) onSuccess(created);
        if (onClose) onClose();
      } else {
        navigate(`/purchases/returns/${created.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create purchase return.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: isModal ? 0 : { xs: 1, sm: 2, md: 3 } }}>
      {!isModal && (
        <PageHeader
          title="Create Purchase Return"
          subtitle="Return items from an existing purchase invoice to vendor and record debit adjustment"
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/purchases/returns')}
            >
              Back to Returns
            </Button>
          }
        />
      )}

      {/* Step 1: Purchase Selector */}
      {!selectedPurchase && (
        <PurchaseSelector onPurchaseSelected={handlePurchaseSelected} />
      )}

      {/* Step 2: Invoice Preview */}
      {selectedPurchase && (
        <OriginalPurchasePreview
          purchase={selectedPurchase}
          onChangePurchase={() => {
            setSelectedPurchase(null);
            setReturnableItems([]);
            setSelectedItems({});
          }}
        />
      )}

      {/* Step 3: Return Items Table */}
      {selectedPurchase && (
        <>
          {loadingItems ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading returnable items…
              </Typography>
            </Box>
          ) : (
            <ReturnablePurchaseItemsTable
              items={returnableItems}
              selectedItems={selectedItems}
              onToggleItem={handleToggleItem}
              onQuantityChange={handleQuantityChange}
              disabled={submitting}
            />
          )}

          {/* Step 4: Return Details */}
          {!loadingItems && returnableItems.length > 0 && (
            <Card sx={{ p: { xs: 2, sm: 3 }, border: 1, borderColor: 'divider', borderRadius: 2, mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Step 4 — Return Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Return Date"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Adjustment / Refund Mode"
                    value={refundMode}
                    onChange={(e) => setRefundMode(e.target.value)}
                    disabled={submitting}
                  >
                    <MenuItem value="CREDIT_ADJUSTMENT">
                      Debit Adjustment (Reduce Vendor Outstanding)
                    </MenuItem>
                    <MenuItem value="CASH">Cash Refund</MenuItem>
                    <MenuItem value="BANK">Bank Transfer Refund</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Reason for Return"
                    value={reasonPreset}
                    onChange={(e) => setReasonPreset(e.target.value)}
                    disabled={submitting}
                  >
                    {REASON_PRESETS.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    inputProps={{ maxLength: 1000 }}
                    disabled={submitting}
                  />
                </Grid>
                {reasonPreset === 'Other' && (
                  <Grid item xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Specify Custom Reason"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              {/* Return Amount Preview */}
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box sx={{ width: { xs: '100%', sm: 'auto' }, textAlign: { xs: 'left', sm: 'left' } }}>
                  <Typography variant="caption" color="text.secondary">ESTIMATED RETURN AMOUNT</Typography>
                  <Typography variant="h5" fontWeight={800} color="warning.dark">
                    ₹ {(estimatedSummary?.returnAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    * Proportional allocation of discounts and taxes
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, '& > button': { width: { xs: '100%', sm: 'auto' } } }}>
                  <Button
                    variant="outlined"
                    onClick={isModal ? onClose : () => navigate('/purchases/returns')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(selectedItems).length === 0}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
                    sx={{ minWidth: 180 }}
                  >
                    {submitting ? 'Processing…' : 'Create Purchase Return'}
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
}
