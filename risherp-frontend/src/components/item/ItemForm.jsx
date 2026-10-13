import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Stack,
  CircularProgress,
  InputAdornment,
  useTheme,
  alpha,
  Chip,
  Divider,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import { DEFAULT_UNITS } from '../../utils/constants';

/**
 * ItemForm Component
 * Clean, flat, modern form for creating and updating inventory products without nested card boxes.
 */
const ItemForm = ({
  initialValues = null,
  isEdit = false,
  categories = [],
  units = DEFAULT_UNITS,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    barcode: '',
    categoryId: '',
    companyName: '',
    unit: 'PCS',
    purchaseRate: '0.00',
    saleRate: '0.00',
    initialStock: '0',
    minimumStock: '0',
    description: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        itemCode: initialValues.itemCode || '',
        itemName: initialValues.itemName || '',
        barcode: initialValues.barcode || '',
        categoryId: initialValues.categoryId || '',
        companyName: initialValues.companyName || '',
        unit: initialValues.unit || 'PCS',
        purchaseRate: initialValues.purchaseRate != null ? String(initialValues.purchaseRate) : '0.00',
        saleRate: initialValues.saleRate != null ? String(initialValues.saleRate) : '0.00',
        initialStock: initialValues.currentStock != null ? String(initialValues.currentStock) : '0',
        minimumStock: initialValues.minimumStock != null ? String(initialValues.minimumStock) : '0',
        description: initialValues.description || '',
        status: initialValues.status || 'ACTIVE',
      });
    }
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.itemName || !formData.itemName.trim()) {
      errs.itemName = 'Item name is required';
    } else if (formData.itemName.trim().length < 2) {
      errs.itemName = 'Item name must be at least 2 characters';
    }

    if (!formData.categoryId) {
      errs.categoryId = 'Category is required';
    }

    if (!formData.unit) {
      errs.unit = 'Unit is required';
    }

    const pRate = parseFloat(formData.purchaseRate);
    if (isNaN(pRate) || pRate < 0) {
      errs.purchaseRate = 'Purchase rate cannot be negative';
    }

    const sRate = parseFloat(formData.saleRate);
    if (isNaN(sRate) || sRate < 0) {
      errs.saleRate = 'Sale rate cannot be negative';
    }

    if (!isEdit) {
      const stock = parseFloat(formData.initialStock);
      if (isNaN(stock) || stock < 0) {
        errs.initialStock = 'Initial stock cannot be negative';
      }
    }

    const minStock = parseFloat(formData.minimumStock);
    if (isNaN(minStock) || minStock < 0) {
      errs.minimumStock = 'Minimum stock cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      itemName: formData.itemName.trim(),
      barcode: formData.barcode?.trim() || null,
      categoryId: formData.categoryId,
      companyName: formData.companyName?.trim() || null,
      unit: formData.unit.trim().toUpperCase(),
      purchaseRate: parseFloat(formData.purchaseRate) || 0,
      saleRate: parseFloat(formData.saleRate) || 0,
      minimumStock: parseFloat(formData.minimumStock) || 0,
      description: formData.description?.trim() || null,
      status: formData.status,
    };

    if (!isEdit) {
      payload.initialStock = parseFloat(formData.initialStock) || 0;
    }

    onSubmit(payload);
  };

  // Margin calculation
  const pRateVal = parseFloat(formData.purchaseRate) || 0;
  const sRateVal = parseFloat(formData.saleRate) || 0;
  const marginAmt = sRateVal - pRateVal;
  const marginPct = sRateVal > 0 ? ((marginAmt / sRateVal) * 100).toFixed(1) : '0.0';

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* SECTION 1: IDENTIFICATION & BARCODE */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.75,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCodeScannerIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Identification & Barcode
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item Code"
                value={isEdit ? formData.itemCode : 'Auto-generated upon save (e.g. ITM-000001)'}
                fullWidth
                size="small"
                disabled
                helperText={
                  isEdit
                    ? 'Permanent system item code'
                    : 'Auto-assigned sequential code'
                }
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.text.primary, 0.03),
                    fontFamily: isEdit ? 'monospace' : 'inherit',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Barcode / SKU"
                placeholder="e.g. 8901234567890"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(errors.barcode)}
                helperText="Optional. Scan with a barcode scanner"
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 2: PRODUCT DETAILS */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.75,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Product Details
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item Name *"
                placeholder="e.g. Wireless Keyboard K380"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(errors.itemName)}
                helperText={errors.itemName || 'Primary product trade name'}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Category *"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(errors.categoryId)}
                helperText={errors.categoryId || 'Classification master'}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="" disabled>
                  Select a Category
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Company / Brand"
                placeholder="e.g. Logitech, Samsung, HP"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                helperText="Manufacturer or brand"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Unit of Measurement *"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(errors.unit)}
                helperText={errors.unit || 'Measurement standard for stock and billing'}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                {units.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 3: PRICING & MARGINS */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.75,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AttachMoneyOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Pricing & Margins
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Purchase Rate *"
                type="text"
                inputProps={{ inputMode: 'decimal',  step: '0.01', min: '0' }}
                value={formData.purchaseRate}
                onChange={(e) => handleChange('purchaseRate', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(errors.purchaseRate)}
                helperText={errors.purchaseRate || 'Cost price per unit'}
                InputProps={{
                  sx: { borderRadius: 2 },
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Sale Rate *"
                type="text"
                inputProps={{ inputMode: 'decimal',  step: '0.01', min: '0' }}
                value={formData.saleRate}
                onChange={(e) => handleChange('saleRate', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(errors.saleRate)}
                helperText={errors.saleRate || 'Default selling price'}
                InputProps={{
                  sx: { borderRadius: 2 },
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: marginAmt >= 0
                    ? isDark ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.success.main, 0.08)
                    : isDark ? alpha(theme.palette.error.main, 0.12) : alpha(theme.palette.error.main, 0.08),
                  border: 1,
                  borderColor: marginAmt >= 0
                    ? alpha(theme.palette.success.main, 0.3)
                    : alpha(theme.palette.error.main, 0.3),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '40px',
                  mb: { xs: 0, sm: '20px' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {marginAmt >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 18, color: 'error.main' }} />
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block', lineHeight: 1 }}>
                      Est. Profit
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color={marginAmt >= 0 ? 'success.main' : 'error.main'} sx={{ lineHeight: 1.1 }}>
                      ₹{marginAmt.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${marginPct}%`}
                  size="small"
                  color={marginAmt >= 0 ? 'success' : 'error'}
                  sx={{ fontWeight: 800, fontSize: '0.72rem', height: 22, borderRadius: '6px' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 4: INVENTORY & STOCK ALERTS */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.75,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WarehouseOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Stock & Inventory Controls
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {isEdit ? (
                <TextField
                  label="Current Stock"
                  value={`${formData.initialStock} ${formData.unit}`}
                  fullWidth
                  size="small"
                  disabled
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.text.primary, 0.03),
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Adjustable via Sales, Purchases, or Adjustments"
                />
              ) : (
                <TextField
                  label="Opening / Initial Stock"
                  type="text"
                  inputProps={{ inputMode: 'decimal',  step: '1', min: '0' }}
                  value={formData.initialStock}
                  onChange={(e) => handleChange('initialStock', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={loading}
                  error={Boolean(errors.initialStock)}
                  helperText={errors.initialStock || 'Opening inventory balance'}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    endAdornment: (
                      <InputAdornment position="end">{formData.unit}</InputAdornment>
                    ),
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Minimum Stock (Alert Level)"
                type="text"
                inputProps={{ inputMode: 'decimal',  step: '1', min: '0' }}
                value={formData.minimumStock}
                onChange={(e) => handleChange('minimumStock', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(errors.minimumStock)}
                helperText={errors.minimumStock || 'Low Stock warnings trigger at or below this'}
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">{formData.unit}</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 5: ADDITIONAL INFORMATION */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.75,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NotesOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Additional Information
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Description / Specifications"
                placeholder="Product specifications, notes, model numbers..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={2}
                fullWidth
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* FORM ACTIONS */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: 'flex-end',
            gap: 1.5,
            pt: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            '& > button': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseOutlinedIcon />}
            onClick={onCancel}
            disabled={loading}
            sx={{ borderRadius: 2.5, px: 3, fontWeight: 600 }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            disabled={loading}
            sx={{ borderRadius: 2.5, px: 3.5, fontWeight: 700 }}
          >
            {loading ? 'Saving Item...' : isEdit ? 'Update Item' : 'Save Item'}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default ItemForm;
