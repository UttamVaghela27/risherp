import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, TextField, Typography, Button, Divider,
  Alert, Stack, Chip, CircularProgress, IconButton, Tooltip,
  FormControlLabel, Checkbox,
  useTheme,
  alpha
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import CustomerSelector from '../../components/sales/CustomerSelector';
import ItemSearch from '../../components/sales/ItemSearch';
import SalesCart from '../../components/sales/SalesCart';
import SaleSummary from '../../components/sales/SaleSummary';
import PaymentSection from '../../components/sales/PaymentSection';
import salesService from '../../services/salesService';
import { calculateLineTotal, calculateSaleTotals, determinePaymentStatus } from '../../utils/saleCalculations';

let cartIdCounter = 1;

/**
 * CreateSale — /sales/new
 * Professional billing screen with full cart management, live calculations, and payment handling.
 *
 * Keyboard UX:
 *  - Tab: move between fields
 *  - Enter (in item search): triggers barcode lookup
 *  - Ctrl+S: save sale
 */
const CreateSale = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const saveRef = useRef(false); // Prevent double-submit

  // Bill header state
  const [customer, setCustomer] = useState(null);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Cart
  const [cartItems, setCartItems] = useState([]);

  // Discount
  const [overallDiscount, setOverallDiscount] = useState('');
  const [overallDiscountType, setOverallDiscountType] = useState('AMOUNT');

  // Payment
  const [saleType, setSaleType] = useState('CASH');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [printAfterSave, setPrintAfterSave] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Derived totals
  const enrichedItems = cartItems.map(item => {
    const { lineSubtotal, discountAmount, lineTotal } = calculateLineTotal(item);
    return { ...item, lineSubtotal, discountAmount, lineTotal };
  });

  const { subtotal, itemDiscount, overallDiscountAmount, totalDiscount, grandTotal } =
    calculateSaleTotals(enrichedItems, overallDiscount, overallDiscountType);

  const paidAmountNum = parseFloat(paidAmount) || 0;
  const balanceAmount = Math.max(0, grandTotal - paidAmountNum);
  const paymentStatus = determinePaymentStatus(paidAmountNum, grandTotal);

  // Auto-set paid amount for CASH sales
  useEffect(() => {
    if (saleType === 'CASH') {
      setPaidAmount(grandTotal.toFixed(2));
    }
  }, [saleType, grandTotal]);

  // Ctrl+S shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!submitting) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitting, customer, cartItems, grandTotal, paidAmount]);

  // Add item to cart (or increment existing)
  const handleItemSelect = useCallback((item) => {
    setCartItems(prev => {
      const existing = prev.find(c => c.itemId === item.id);
      if (existing) {
        // Increment quantity if same item
        return prev.map(c =>
          c.itemId === item.id
            ? { ...c, quantity: (parseFloat(c.quantity) + 1).toString() }
            : c
        );
      }
      // New item
      const newItem = {
        cartId: cartIdCounter++,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        unit: item.unit,
        availableStock: parseFloat(item.currentStock) || 0,
        quantity: '1',
        rate: item.saleRate?.toString() || '0',
        discountType: 'AMOUNT',
        discountValue: '0',
      };
      return [...prev, newItem];
    });
  }, []);

  const handleUpdateItem = (cartId, updates) => {
    setCartItems(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, ...updates } : item
    ));
  };

  const handleRemoveItem = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const validate = () => {
    const errs = {};
    if (!customer) errs.customer = 'Customer is required';
    if (!saleDate) errs.saleDate = 'Sale date is required';
    if (cartItems.length === 0) errs.items = 'At least one item is required';

    // Check stock
    for (const item of enrichedItems) {
      const qty = parseFloat(item.quantity);
      if (!qty || qty <= 0) {
        errs.items = `Quantity must be > 0 for ${item.itemName}`;
        break;
      }
      if (qty > item.availableStock) {
        errs.items = `Insufficient stock for ${item.itemName}. Available: ${item.availableStock} ${item.unit}`;
        break;
      }
    }

    if (paidAmountNum < 0) errs.paidAmount = 'Paid amount cannot be negative';
    if (paidAmountNum > grandTotal) errs.paidAmount = `Paid amount cannot exceed ₹${grandTotal.toFixed(2)}`;
    if ((saleType === 'CASH' || saleType === 'PARTIAL') && paidAmountNum > 0 && !paymentMode) {
      errs.paymentMode = 'Payment mode is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (printAfter = false) => {
    if (saveRef.current || submitting) return;
    if (!validate()) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    saveRef.current = true;
    setSubmitting(true);

    const payload = {
      partyId: customer.id,
      saleDate,
      saleType,
      items: enrichedItems.map(item => ({
        itemId: item.itemId,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        discountType: item.discountType,
        discountValue: parseFloat(item.discountValue) || 0,
      })),
      overallDiscountType,
      overallDiscount: parseFloat(overallDiscount) || 0,
      paidAmount: paidAmountNum,
      paymentMode: paidAmountNum > 0 ? paymentMode : null,
      notes: notes.trim() || null,
    };

    try {
      const res = await salesService.createSale(payload);
      if (res?.success) {
        const invoiceNum = res.data.invoiceNumber;
        toast.success(`Sale ${invoiceNum} created successfully!`);
        if (printAfter) {
          navigate(`/sales/${res.data.id}?print=true`);
        } else {
          navigate(`/sales/${res.data.id}`);
        }
      }
    } catch {
      // Error shown by axios interceptor — do NOT clear cart
      saveRef.current = false;
    } finally {
      setSubmitting(false);
      saveRef.current = false;
    }
  };

  const hasStockWarning = enrichedItems.some(
    item => parseFloat(item.quantity) > item.availableStock
  );

  return (
    <Box>
      <PageHeader
        title="New Sale"
        description="Create a new sales invoice for a customer."
        secondaryAction={{
          label: 'Back to Sales',
          onClick: () => navigate('/sales'),
          variant: 'outlined',
        }}
      />

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 380px', xl: '1fr 420px' },
        gap: 3,
        alignItems: 'start',
      }}>
        {/* LEFT — Master Billing Desk */}
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
          {/* Header Ribbon: Customer & Date Selection */}
          <Box sx={{ p: 2.5, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  border: '1px solid #bfdbfe'
                }}>
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color={theme.palette.text.primary} sx={{ lineHeight: 1.2 }}>
                    Billing Desk
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Invoice number will be auto-generated upon saving
                  </Typography>
                </Box>
              </Box>
              <Chip label="NEW INVOICE" size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.15), color: '#3730a3', fontSize: 11 }} />
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 220px' },
              gap: 2,
              alignItems: 'start',
            }}>
              {/* Customer Selector */}
              <Box sx={{ minWidth: 0 }}>
                <CustomerSelector
                  value={customer}
                  onChange={(val) => { setCustomer(val); setErrors(e => ({ ...e, customer: null })); }}
                  error={!!errors.customer}
                  helperText={errors.customer}
                  disabled={submitting}
                />
                {customer && (
                  <Box sx={{ mt: 1, p: 1.25, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color={theme.palette.info.dark}>{customer.partyName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.partyCode} • {customer.mobile || 'No Mobile'}{customer.city ? ` • ${customer.city}` : ''}
                      </Typography>
                    </Box>
                    <Tooltip title="Clear customer">
                      <IconButton size="small" onClick={() => setCustomer(null)} tabIndex={-1}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {/* Date */}
              <TextField
                fullWidth
                type="date"
                label="Sale Date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.saleDate}
                helperText={errors.saleDate}
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
            <ItemSearch onItemSelect={handleItemSelect} disabled={submitting} />
            {errors.items && (
              <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>{errors.items}</Alert>
            )}
          </Box>

          {/* Interactive Cart Section */}
          <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary} sx={{ letterSpacing: '0.05em' }}>
                CART ITEMS ({cartItems.length})
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

            <SalesCart
              items={enrichedItems}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
            />

            {hasStockWarning && (
              <Alert severity="warning" sx={{ mt: 2, py: 0.5 }}>
                Some items exceed available stock. Please adjust quantities.
              </Alert>
            )}

            {/* Integrated Notes Field */}
            <Box sx={{ mt: 2.5 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Sale Notes & Remarks (optional)"
                placeholder="Add delivery instructions, payment terms, or invoice remarks..."
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
              <PointOfSaleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={800} color={theme.palette.text.secondary} sx={{ letterSpacing: '0.05em' }}>
                CHECKOUT TERMINAL
              </Typography>
            </Box>
            <Chip label="LIVE" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
              {/* Summary */}
              <SaleSummary
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
              <PaymentSection
                saleType={saleType}
                paymentMode={paymentMode}
                paidAmount={paidAmount}
                grandTotal={grandTotal}
                balanceAmount={balanceAmount}
                paymentStatus={paymentStatus}
                onSaleTypeChange={setSaleType}
                onPaymentModeChange={setPaymentMode}
                onPaidAmountChange={setPaidAmount}
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
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {submitting ? 'Saving Sale...' : `Save Sale • ₹ ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </Button>

                {/* Options Row: Print Checkbox + Cancel Link */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={printAfterSave}
                        onChange={(e) => setPrintAfterSave(e.target.checked)}
                        sx={{ p: 0.5, color: theme.palette.text.secondary, '&.Mui-checked': { color: 'primary.main' } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PrintIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Print invoice
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, userSelect: 'none' }}
                  />

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => navigate('/sales')}
                    disabled={submitting}
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { color: 'error.main', bgcolor: 'transparent' }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>

                {/* Helper Status / Tip Pill */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 0.75,
                  px: 1.5,
                  borderRadius: '8px',
                  bgcolor: (!customer || cartItems.length === 0) ? '#fff7ed' : theme.palette.background.default,
                  border: (!customer || cartItems.length === 0) ? '1px solid #fed7aa' : '1px solid #f1f5f9'
                }}>
                  {(!customer || cartItems.length === 0) ? (
                    <Typography variant="caption" color="#c2410c" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                      ⚠️ {!customer ? 'Please select a customer above' : 'Please add at least 1 item to cart'}
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
    </Box>
  );
};

export default CreateSale;
