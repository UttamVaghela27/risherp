import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Grid, Typography, TextField, MenuItem, Button,
  Stack, Divider, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import PageHeader from '../../components/common/PageHeader';
import PurchaseSelector from '../../components/purchaseReturn/PurchaseSelector';
import OriginalPurchasePreview from '../../components/purchaseReturn/OriginalPurchasePreview';
import ReturnablePurchaseItemsTable from '../../components/purchaseReturn/ReturnablePurchaseItemsTable';
import purchaseReturnService from '../../services/purchaseReturnService';
import { formatCurrency } from '../../utils/formatters';
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

  const handleQuantityChange = (purchaseItemId, value, maxLimit) => {
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
          const disc = (item.discountAmount || 0) * prop;
          subtotal += lineTotal;
          itemDiscount += disc;
        }
      }
    });

    // Proportional share of overall discount
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

    if (!selectedPurchase) {
      toast.error('Please select an original purchase first.');
      return;
    }

    const selectedKeys = Object.keys(selectedItems);
    if (selectedKeys.length === 0) {
      toast.error('Please select at least one item to return.');
      return;
    }

    // Build payload items
    const itemsPayload = [];
    for (const pItemId of selectedKeys) {
      const sel = selectedItems[pItemId];
      const qty = parseFloat(sel.returnQuantity);
      if (isNaN(qty) || qty <= 0) {
        toast.error('Please enter a valid return quantity (> 0) for all selected items.');
        return;
      }
      const originalItem = returnableItems.find((i) => String(i.purchaseItemId) === String(pItemId));
      if (originalItem && qty > originalItem.returnableQuantity) {
        toast.error(`Return quantity for ${originalItem.itemNameSnapshot} exceeds returnable quantity (${originalItem.returnableQuantity}).`);
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
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: isModal ? 0 : 3 }}>
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
      {!selectedPurchase ? (
        <PurchaseSelector onPurchaseSelected={handlePurchaseSelected} />
      ) : (
        <OriginalPurchasePreview
          purchase={selectedPurchase}
          onChangePurchase={() => {
            setSelectedPurchase(null);
            setReturnableItems([]);
            setSelectedItems({});
          }}
        />
      )}

      {/* Step 2: Return Items Table */}
      {selectedPurchase && (
        <>
          {loadingItems ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
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

          {/* Step 3: Form Details & Estimated Summary */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Return Details & Adjustment
                </Typography>

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="date"
                      fullWidth
                      size="small"
                      label="Return Date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      InputLabelProps={{ shrink: true }}
                      disabled={submitting}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
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

                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Reason for Return"
                      value={reasonPreset}
                      onChange={(e) => setReasonPreset(e.target.value)}
                      disabled={submitting}
                    >
                      {REASON_PRESETS.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {reasonPreset === 'Other' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Specify Reason"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        disabled={submitting}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      label="Notes / Vendor Remarks"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Return Financial Summary
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Calculated proportionally using original purchase prices and discounts.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Return Subtotal
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(estimatedSummary?.subtotal || 0)}
                    </Typography>
                  </Stack>

                  {(estimatedSummary?.itemDiscount || 0) > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Item Discounts (Estimated)
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        - {formatCurrency(estimatedSummary.itemDiscount)}
                      </Typography>
                    </Stack>
                  )}

                  {(estimatedSummary?.overallDiscountAllocated || 0) > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Overall Discount Share
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        - {formatCurrency(estimatedSummary.overallDiscountAllocated)}
                      </Typography>
                    </Stack>
                  )}

                  <Divider />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>
                      Estimated Return Amount
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="error.main">
                      {formatCurrency(estimatedSummary?.returnAmount || 0)}
                    </Typography>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(selectedItems).length === 0}
                    sx={{ mt: 2, height: 48 }}
                  >
                    {submitting ? 'Processing Return...' : 'Confirm & Create Purchase Return'}
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
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
