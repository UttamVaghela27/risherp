import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Stack,
  CircularProgress,
  InputAdornment,
  Alert,
  Autocomplete,
  useTheme,
  alpha
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { DEFAULT_UNITS } from '../../utils/constants';

/**
 * ItemForm Component
 * Production-ready form for creating and updating inventory products.
 * Strictly guarantees currentStock cannot be altered during normal edits.
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

  // Margin preview calculation
  const pRateVal = parseFloat(formData.purchaseRate) || 0;
  const sRateVal = parseFloat(formData.saleRate) || 0;
  const marginAmt = sRateVal - pRateVal;
  const marginPct = sRateVal > 0 ? ((marginAmt / sRateVal) * 100).toFixed(1) : 0;

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* IDENTIFICATION CARD */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <QrCodeScannerIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Identification & Coding
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Item Code"
                  value={isEdit ? formData.itemCode : 'Auto-generated upon save (e.g. ITM-000001)'}
                  fullWidth
                  size="small"
                  disabled
                  helperText={
                    isEdit
                      ? 'Permanent unique system identifier'
                      : 'System automatically generates a consecutive, conflict-free code'
                  }
                  InputProps={{
                    sx: { bgcolor: 'background.default', fontFamily: isEdit ? 'monospace' : 'inherit' },
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
                  helperText="Optional. Can be scanned directly with a barcode scanner."
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ITEM INFORMATION CARD */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Inventory2OutlinedIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Product Information
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
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
                  helperText={errors.categoryId || 'Select classification master'}
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
                  helperText="Manufacturer or brand identity"
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
                >
                  {units.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* PRICING CARD */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <AttachMoneyOutlinedIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Pricing & Margins
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Purchase Rate *"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.purchaseRate}
                  onChange={(e) => handleChange('purchaseRate', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={loading}
                  error={Boolean(errors.purchaseRate)}
                  helperText={errors.purchaseRate || 'Cost price per unit'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  label="Sale Rate *"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.saleRate}
                  onChange={(e) => handleChange('saleRate', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={loading}
                  error={Boolean(errors.saleRate)}
                  helperText={errors.saleRate || 'Default selling price per unit'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: marginAmt >= 0 ? '#f0fdf4' : alpha(theme.palette.error.main, 0.1),
                    border: '1px solid',
                    borderColor: marginAmt >= 0 ? '#bbf7d0' : alpha(theme.palette.error.main, 0.2),
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Estimated Margin
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={800}
                    color={marginAmt >= 0 ? 'success.dark' : 'error.dark'}
                  >
                    {marginPct}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* INVENTORY CARD */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <WarehouseOutlinedIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Inventory & Stock Alerts
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                {isEdit ? (
                  <TextField
                    label="Current Stock"
                    value={`${formData.initialStock} ${formData.unit}`}
                    fullWidth
                    size="small"
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      sx: { bgcolor: 'background.default' },
                    }}
                    helperText="Stock can only be modified through Sales, Purchases, or Stock Adjustments (Phase 12)."
                  />
                ) : (
                  <TextField
                    label="Opening / Initial Stock"
                    type="number"
                    inputProps={{ step: '1', min: '0' }}
                    value={formData.initialStock}
                    onChange={(e) => handleChange('initialStock', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={loading}
                    error={Boolean(errors.initialStock)}
                    helperText={errors.initialStock || 'Opening inventory balance on creation'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">{formData.unit}</InputAdornment>
                      ),
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimum Stock (Safety Threshold)"
                  type="number"
                  inputProps={{ step: '1', min: '0' }}
                  value={formData.minimumStock}
                  onChange={(e) => handleChange('minimumStock', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={loading}
                  error={Boolean(errors.minimumStock)}
                  helperText={
                    errors.minimumStock || 'When stock drops below or equals this, Low Stock alerts trigger.'
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">{formData.unit}</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* OTHER CARD */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <NotesOutlinedIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Additional Information
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label="Description / Specifications"
                  placeholder="Detailed product specifications, notes, model numbers..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* FORM ACTIONS */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1, pb: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseOutlinedIcon />}
            onClick={onCancel}
            disabled={loading}
            sx={{ px: 3 }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            disabled={loading}
            sx={{ px: 4 }}
          >
            {loading ? 'Saving Item...' : isEdit ? 'Update Item' : 'Save Item'}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default ItemForm;
