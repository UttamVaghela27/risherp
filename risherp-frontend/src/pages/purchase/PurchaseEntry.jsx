import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, TextField, Typography, Button, Divider,
  Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, IconButton, Tooltip, FormControlLabel, Checkbox, Chip,
  useTheme,
  alpha
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import SupplierSelector from '../../components/purchase/SupplierSelector';
import PurchaseItemSearch from '../../components/purchase/PurchaseItemSearch';
import PurchaseCart from '../../components/purchase/PurchaseCart';
import PurchaseSummary from '../../components/purchase/PurchaseSummary';
import PurchasePaymentSection from '../../components/purchase/PurchasePaymentSection';
import purchaseService from '../../services/purchaseService';
import {
  calculateLineTotal,
  calculateSaleTotals,
  determinePaymentStatus,
  formatCurrency
} from '../../utils/saleCalculations';

let cartIdCounter = 1;

/**
 * PurchaseEntry — /purchases/new
 * Enterprise purchase invoice entry workspace.
 * Manages supplier selection, item addition, stock increments, rates, discounts,
 * and supplier payable balances.
 */
const PurchaseEntry = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const saveRef = useRef(false);

  // Invoice Header
  const [supplier, setSupplier] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Cart
  const [cartItems, setCartItems] = useState([]);

  // Discounts
  const [overallDiscount, setOverallDiscount] = useState('');
  const [overallDiscountType, setOverallDiscountType] = useState('AMOUNT');

  // Payments
  const [purchaseType, setPurchaseType] = useState('CREDIT');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState('0');
  const [printAfterSave, setPrintAfterSave] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  // Derived calculations
  const enrichedItems = cartItems.map(item => {
    const { lineSubtotal, discountAmount, lineTotal } = calculateLineTotal(item);
    return { ...item, lineSubtotal, discountAmount, lineTotal };
  });

  const { subtotal, itemDiscount, overallDiscountAmount, totalDiscount, grandTotal } =
    calculateSaleTotals(enrichedItems, overallDiscount, overallDiscountType);

  const paidAmountNum = parseFloat(paidAmount) || 0;
  const balanceAmount = Math.max(0, grandTotal - paidAmountNum);
  const paymentStatus = determinePaymentStatus(paidAmountNum, grandTotal);

  // When switching to CASH, default paid amount to grand total
  useEffect(() => {
    if (purchaseType === 'CASH') {
      setPaidAmount(grandTotal.toFixed(2));
    }
  }, [purchaseType, grandTotal]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!submitting && !successData) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitting, supplier, cartItems, grandTotal, paidAmount, successData]);

  // Handlers
  const handleItemSelect = (item) => {
    if (!item) return;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(ci => ci.itemId === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const currentQty = parseFloat(updated[existingIndex].quantity) || 0;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (currentQty + 1).toString(),
        };
        return updated;
      }

      return [
        ...prev,
        {
          cartId: cartIdCounter++,
          itemId: item.id,
          itemName: item.itemName || item.name || 'Item',
          itemCode: item.itemCode || '',
          companyName: item.companyName || '',
          unit: item.unit || 'PCS',
          quantity: '1',
          rate: (item.purchaseRate != null ? item.purchaseRate : (item.saleRate || 0)).toString(),
          discountType: 'AMOUNT',
          discountValue: '0',
          currentStock: parseFloat(item.currentStock) || 0,
        },
      ];
    });

    if (errors.items) {
      setErrors(e => ({ ...e, items: null }));
    }
  };

  const handleUpdateItem = (cartId, updates) => {
    setCartItems(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, ...updates } : item
    ));
  };

  const handleRemoveItem = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleReset = () => {
    setSupplier(null);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setCartItems([]);
    setOverallDiscount('');
    setOverallDiscountType('AMOUNT');
    setPurchaseType('CREDIT');
    setPaymentMode('CASH');
    setPaidAmount('0');
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!supplier) errs.supplier = 'Please select a supplier';
    if (!purchaseDate) errs.purchaseDate = 'Purchase date is required';
    if (cartItems.length === 0) errs.items = 'Please add at least one item to purchase';

    for (const item of enrichedItems) {
      const qty = parseFloat(item.quantity);
      if (!qty || qty <= 0) {
        errs.items = `Quantity must be greater than 0 for ${item.itemName}`;
        break;
      }
      const rate = parseFloat(item.rate);
      if (isNaN(rate) || rate < 0) {
        errs.items = `Purchase rate cannot be negative for ${item.itemName}`;
        break;
      }
    }

    if (paidAmountNum < 0) errs.paidAmount = 'Paid amount cannot be negative';
    if (paidAmountNum > grandTotal) errs.paidAmount = `Paid amount cannot exceed grand total ₹${grandTotal.toFixed(2)}`;
    if ((purchaseType === 'CASH' || purchaseType === 'PARTIAL') && paidAmountNum > 0 && !paymentMode) {
      errs.paymentMode = 'Payment mode is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (printAfter = false) => {
    if (saveRef.current || submitting) return;
    if (!validate()) {
      toast.error('Please resolve the highlighted errors.');
      return;
    }

    saveRef.current = true;
    setSubmitting(true);

    const payload = {
      partyId: supplier.id,
      purchaseDate,
      purchaseType,
      items: enrichedItems.map(item => ({
        itemId: item.itemId,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        discountType: item.discountType || 'AMOUNT',
        discountValue: parseFloat(item.discountValue) || 0,
      })),
      overallDiscountType: overallDiscountType || 'AMOUNT',
      overallDiscount: parseFloat(overallDiscount) || 0,
      paidAmount: paidAmountNum,
      paymentMode: paidAmountNum > 0 ? (paymentMode || 'CASH') : null,
      notes: notes.trim() || null,
    };

    try {
      const res = await purchaseService.createPurchase(payload);
      if (res?.success) {
        const purchaseNum = res.data.purchaseNumber;
        toast.success(`Purchase ${purchaseNum} saved successfully!`);
        if (printAfter) {
          navigate(`/purchases/${res.data.id}?print=true`);
        } else {
          setSuccessData(res.data);
        }
      }
    } catch {
      // Error handled by interceptor
      saveRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Bar */}
      <PageHeader
        title="Purchase Entry"
        description="Record vendor purchase invoice, increase inventory stock, and track payable balance"
        secondaryAction={{
          label: 'Back to Purchases',
          icon: <ArrowBackIcon />,
          variant: 'outlined',
          onClick: () => navigate('/purchases'),
        }}
      />

      {/* Main Form Body */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 380px', xl: '1fr 420px' },
        gap: 3,
        alignItems: 'start',
      }}>
        {/* LEFT — Master Purchase Billing Desk */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: '16px',
            border: 1, borderColor: 'divider',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {/* Header Ribbon: Supplier & Date Selection */}
          <Box sx={{ p: 2.5, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.success.main,
                  border: '1px solid #a7f3d0'
                }}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color={theme.palette.text.primary} sx={{ lineHeight: 1.2 }}>
                    Purchase Entry Desk
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bill number will be auto-generated upon saving
                  </Typography>
                </Box>
              </Box>
              <Chip label="NEW PURCHASE" size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.1), color: '#065f46', fontSize: 11 }} />
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 220px' },
              gap: 2,
              alignItems: 'start',
            }}>
              {/* Supplier Selector */}
              <Box sx={{ minWidth: 0 }}>
                <SupplierSelector
                  value={supplier}
                  onChange={(val) => {
                    setSupplier(val);
                    if (errors.supplier) setErrors(e => ({ ...e, supplier: null }));
                  }}
                  error={!!errors.supplier}
                  helperText={errors.supplier}
                  disabled={submitting}
                />
                {supplier && (
                  <Box sx={{ mt: 1, p: 1.25, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #bfdbfe' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color={theme.palette.info.dark}>
                        {supplier.partyName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {supplier.partyCode} • {supplier.mobile || 'No Mobile'}{supplier.city ? ` • ${supplier.city}` : ''}
                      </Typography>
                    </Box>
                    <Tooltip title="Change supplier">
                      <IconButton size="small" onClick={() => setSupplier(null)} tabIndex={-1}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {/* Purchase Date */}
              <TextField
                fullWidth
                label="Purchase Date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={submitting}
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    height: '52px',
                  }
                }}
              />
            </Box>
          </Box>

          {/* Search & Add Items Section */}
          <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary} sx={{ letterSpacing: '0.05em' }}>
                SCAN OR SEARCH PRODUCTS
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Barcode scanner ready (Press Enter to scan)
              </Typography>
            </Box>
            <PurchaseItemSearch
              onItemSelect={handleItemSelect}
              disabled={submitting}
            />
            {errors.items && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.items}
              </Typography>
            )}
          </Box>

          {/* Interactive Cart Section */}
          <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary} sx={{ letterSpacing: '0.05em' }}>
                PURCHASE ITEMS ({cartItems.length})
              </Typography>
              {cartItems.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  onClick={() => setCartItems([])}
                  tabIndex={-1}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0 }}
                >
                  Clear Cart
                </Button>
              )}
            </Box>

            <PurchaseCart
              items={enrichedItems}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
            />

            {/* Integrated Notes Field */}
            <Box sx={{ mt: 2.5 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Purchase Notes & Remarks (optional)"
                placeholder="Add supplier invoice number, payment terms, or purchase remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
                variant="outlined"
                sx={{
                  bgcolor: 'background.default',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    '&:hover fieldset': { borderColor: 'divider' }
                  }
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* RIGHT — Master Checkout Terminal */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: '16px',
            border: 1, borderColor: 'divider',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08)',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            position: { lg: 'sticky' },
            top: { lg: 24 }
          }}
        >
          {/* Terminal Header */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PointOfSaleIcon sx={{ color: '#0f766e', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={800} color={theme.palette.text.secondary} sx={{ letterSpacing: '0.05em' }}>
                PURCHASE TERMINAL
              </Typography>
            </Box>
            <Chip label="LIVE" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
              {/* Summary */}
              <PurchaseSummary
                subtotal={subtotal}
                itemDiscount={itemDiscount}
                overallDiscount={overallDiscount}
                overallDiscountType={overallDiscountType}
                grandTotal={grandTotal}
                onOverallDiscountChange={setOverallDiscount}
                onOverallDiscountTypeChange={setOverallDiscountType}
              />

              <Divider />

              {/* Payment Section */}
              <PurchasePaymentSection
                purchaseType={purchaseType}
                paymentMode={paymentMode}
                paidAmount={paidAmount}
                grandTotal={grandTotal}
                balanceAmount={balanceAmount}
                paymentStatus={paymentStatus}
                notes={notes}
                onPurchaseTypeChange={setPurchaseType}
                onPaymentModeChange={setPaymentMode}
                onPaidAmountChange={setPaidAmount}
                onNotesChange={setNotes}
                errors={errors}
              />

              <Divider />

              {/* Master Save Button & Controls */}
              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={() => handleSave(printAfterSave)}
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '0.02em',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
                      boxShadow: '0 6px 20px rgba(13, 148, 136, 0.45)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {submitting ? 'Saving Purchase...' : `Save Purchase • ₹ ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </Button>

                {/* Options Row: Print Checkbox + Reset Form Link */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={printAfterSave}
                        onChange={(e) => setPrintAfterSave(e.target.checked)}
                        sx={{ p: 0.5, color: theme.palette.text.secondary, '&.Mui-checked': { color: '#0f766e' } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PrintIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Print purchase
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, userSelect: 'none' }}
                  />

                  <Button
                    size="small"
                    variant="text"
                    onClick={handleReset}
                    disabled={submitting}
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { color: 'error.main', bgcolor: 'transparent' }
                    }}
                  >
                    Reset Form
                  </Button>
                </Box>

                {/* Helper status / shortcut pill */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 0.75,
                  px: 1.5,
                  borderRadius: '8px',
                  bgcolor: (!supplier || cartItems.length === 0) ? '#fff7ed' : theme.palette.background.default,
                  border: (!supplier || cartItems.length === 0) ? '1px solid #fed7aa' : '1px solid #f1f5f9'
                }}>
                  {(!supplier || cartItems.length === 0) ? (
                    <Typography variant="caption" color="#c2410c" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                      ⚠️ {!supplier ? 'Please select a supplier above' : 'Please add at least 1 item to cart'}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Tip: Press <strong>Ctrl + S</strong> to save anytime
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Success Dialog */}
      {successData && (
        <Dialog
          open={true}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: isDark ? '0 24px 48px -12px rgba(0,0,0,0.8)' : '0 24px 48px -12px rgba(15,23,42,0.18)',
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 3.5, pb: 1.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <CheckCircleOutlinedIcon sx={{ fontSize: 34 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.25 }}>
              Purchase Saved Successfully
            </Typography>
            <Chip
              label={successData.purchaseNumber}
              color="primary"
              size="small"
              sx={{ mt: 1, fontWeight: 750, fontFamily: 'monospace', borderRadius: '6px' }}
            />
          </DialogTitle>

          <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 1.5 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.text.primary, 0.02),
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Supplier:
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {successData.partyName}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Grand Total:
                </Typography>
                <Typography variant="body1" fontWeight={800} color="primary.main">
                  {formatCurrency(successData.grandTotal)}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Payment Status:
                </Typography>
                <Chip
                  label={successData.paymentStatus}
                  size="small"
                  color={
                    successData.paymentStatus === 'PAID'
                      ? 'success'
                      : successData.paymentStatus === 'PARTIAL'
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22, borderRadius: '6px' }}
                />
              </Box>
            </Paper>
          </DialogContent>

          <DialogActions
            sx={{
              p: 2.5,
              px: { xs: 2.5, sm: 3.5 },
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<VisibilityOutlinedIcon />}
              onClick={() => navigate(`/purchases/${successData.id}`)}
              sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
            >
              View Details
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSuccessData(null);
                handleReset();
                saveRef.current = false;
              }}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, width: { xs: '100%', sm: 'auto' } }}
            >
              New Purchase
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PurchaseEntry;
