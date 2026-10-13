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
  FormHelperText,
  Divider,
  useTheme,
  alpha,
  InputAdornment,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

/**
 * PartyForm Component
 * Clean, flat, modern form for creating or updating Party records without cluttered nested card boxes.
 */
const PartyForm = ({
  initialValues = null,
  isEdit = false,
  onSubmit,
  onCancel,
  loading = false,
  defaultPartyType = 'CUSTOMER',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState({
    partyName: '',
    partyType: defaultPartyType,
    contactPerson: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    openingBalance: '0',
    openingBalanceType: defaultPartyType === 'SUPPLIER' ? 'PAYABLE' : 'RECEIVABLE',
    creditLimit: '0',
    notes: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        partyName: initialValues.partyName || '',
        partyType: initialValues.partyType || defaultPartyType,
        contactPerson: initialValues.contactPerson || '',
        mobile: initialValues.mobile || '',
        alternateMobile: initialValues.alternateMobile || '',
        email: initialValues.email || '',
        address: initialValues.address || '',
        city: initialValues.city || '',
        state: initialValues.state || '',
        pincode: initialValues.pincode || '',
        openingBalance: initialValues.openingBalance != null ? String(initialValues.openingBalance) : '0',
        openingBalanceType: initialValues.openingBalanceType || (defaultPartyType === 'SUPPLIER' ? 'PAYABLE' : 'RECEIVABLE'),
        creditLimit: initialValues.creditLimit != null ? String(initialValues.creditLimit) : '0',
        notes: initialValues.notes || '',
        status: initialValues.status || 'ACTIVE',
      });
    }
  }, [initialValues, defaultPartyType]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'partyType') {
        if (value === 'CUSTOMER' && updated.openingBalanceType === 'PAYABLE') {
          updated.openingBalanceType = 'RECEIVABLE';
        } else if (value === 'SUPPLIER' && updated.openingBalanceType === 'RECEIVABLE') {
          updated.openingBalanceType = 'PAYABLE';
        }
      }

      if (field === 'openingBalance') {
        const num = parseFloat(value) || 0;
        if (num === 0) {
          updated.openingBalanceType = 'NONE';
        } else if (num > 0 && prev.openingBalanceType === 'NONE') {
          updated.openingBalanceType = updated.partyType === 'SUPPLIER' ? 'PAYABLE' : 'RECEIVABLE';
        }
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = null;

    switch (field) {
      case 'partyName':
        if (!value || !value.trim()) {
          error = 'Party name is required.';
        } else if (value.trim().length < 2) {
          error = 'Party name must be at least 2 characters.';
        } else if (value.trim().length > 150) {
          error = 'Party name cannot exceed 150 characters.';
        }
        break;

      case 'mobile':
        if (!value || !value.trim()) {
          error = 'Mobile number is required.';
        } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
          error = 'Please enter a valid 10-digit Indian mobile number.';
        }
        break;

      case 'alternateMobile':
        if (value && value.trim() && !/^[6-9]\d{9}$/.test(value.trim())) {
          error = 'Please enter a valid 10-digit Indian mobile number.';
        }
        break;

      case 'email':
        if (value && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Please enter a valid email address.';
        }
        break;

      case 'pincode':
        if (value && value.trim() && !/^\d{6}$/.test(value.trim())) {
          error = 'Please enter a valid 6-digit PIN code.';
        }
        break;

      case 'openingBalance': {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          error = 'Opening balance must be 0 or a positive number.';
        }
        break;
      }

      case 'creditLimit': {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          error = 'Credit limit must be 0 or a positive number.';
        }
        break;
      }

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === null;
  };

  const validateAll = () => {
    const fieldsToValidate = [
      'partyName',
      'mobile',
      'alternateMobile',
      'email',
      'pincode',
      'openingBalance',
      'creditLimit',
    ];

    let isValid = true;
    const newErrors = {};

    fieldsToValidate.forEach((f) => {
      const valid = validateField(f, formData[f]);
      if (!valid) isValid = false;
    });

    const opBal = parseFloat(formData.openingBalance) || 0;
    if (opBal > 0 && (!formData.openingBalanceType || formData.openingBalanceType === 'NONE')) {
      newErrors.openingBalanceType = 'Please select whether balance is Receivable or Payable.';
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      partyName: true,
      mobile: true,
      alternateMobile: true,
      email: true,
      pincode: true,
      openingBalance: true,
      creditLimit: true,
    });

    if (!validateAll()) {
      return;
    }

    const payload = {
      ...formData,
      openingBalance: parseFloat(formData.openingBalance) || 0,
      creditLimit: parseFloat(formData.creditLimit) || 0,
      openingBalanceType:
        (parseFloat(formData.openingBalance) || 0) === 0 ? 'NONE' : formData.openingBalanceType,
    };

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        {/* SECTION 1: PARTY INFORMATION */}
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
              <BusinessIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Party Information
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                id="partyName"
                label="Party Name"
                placeholder="e.g. ABC Traders, Shri Ganesh Enterprises"
                value={formData.partyName}
                onChange={(e) => handleChange('partyName', e.target.value)}
                onBlur={() => handleBlur('partyName')}
                error={Boolean(errors.partyName)}
                helperText={errors.partyName || 'Legal trade name or registered business name'}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                required
                id="partyType"
                label="Party Type"
                value={formData.partyType}
                onChange={(e) => handleChange('partyType', e.target.value)}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="CUSTOMER">Customer (Buyer)</MenuItem>
                <MenuItem value="SUPPLIER">Supplier (Vendor)</MenuItem>
                <MenuItem value="BOTH">Both (Customer & Supplier)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 2: CONTACT INFORMATION */}
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
              <ContactPhoneOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Contact Information
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="contactPerson"
                label="Contact Person"
                placeholder="e.g. Rahul Patel, Accounts Manager"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                onBlur={() => handleBlur('contactPerson')}
                error={Boolean(errors.contactPerson)}
                helperText={errors.contactPerson}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="mobile"
                label="Mobile Number"
                placeholder="e.g. 9876543210"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                onBlur={() => handleBlur('mobile')}
                error={Boolean(errors.mobile)}
                helperText={errors.mobile || '10-digit primary mobile for invoices and SMS'}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="alternateMobile"
                label="Alternate Mobile"
                placeholder="e.g. 9823456789 (optional)"
                value={formData.alternateMobile}
                onChange={(e) => handleChange('alternateMobile', e.target.value)}
                onBlur={() => handleBlur('alternateMobile')}
                error={Boolean(errors.alternateMobile)}
                helperText={errors.alternateMobile}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                type="email"
                label="Email Address"
                placeholder="e.g. accounts@abctraders.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={Boolean(errors.email)}
                helperText={errors.email || 'Used for e-invoices and billing statements'}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 3: ADDRESS DETAILS */}
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
              <PlaceOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Address Details
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                label="Street Address / Shop No."
                placeholder="e.g. Shop 12, Millennium Textile Market, Ring Road"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                error={Boolean(errors.address)}
                helperText={errors.address}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="city"
                label="City"
                placeholder="e.g. Surat"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                error={Boolean(errors.city)}
                helperText={errors.city}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="state"
                label="State"
                placeholder="e.g. Gujarat"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                onBlur={() => handleBlur('state')}
                error={Boolean(errors.state)}
                helperText={errors.state}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="pincode"
                label="PIN Code"
                placeholder="e.g. 395002"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                onBlur={() => handleBlur('pincode')}
                error={Boolean(errors.pincode)}
                helperText={errors.pincode}
                size="small"
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 4: FINANCIAL INFORMATION */}
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
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                Financial Settings
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="openingBalance"
                type="text"
                label="Opening Balance"
                value={formData.openingBalance}
                onChange={(e) => handleChange('openingBalance', e.target.value)}
                onBlur={() => handleBlur('openingBalance')}
                error={Boolean(errors.openingBalance)}
                helperText={errors.openingBalance || 'Initial opening balance'}
                inputProps={{ inputMode: 'decimal',  min: '0', step: '0.01' }}
                size="small"
                disabled={loading}
                InputProps={{
                  sx: { borderRadius: 2 },
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                required
                id="openingBalanceType"
                label="Balance Type"
                value={
                  parseFloat(formData.openingBalance) === 0
                    ? 'NONE'
                    : formData.openingBalanceType
                }
                onChange={(e) => handleChange('openingBalanceType', e.target.value)}
                disabled={parseFloat(formData.openingBalance) === 0 || loading}
                error={Boolean(errors.openingBalanceType)}
                size="small"
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="NONE">None (₹0.00 Balance)</MenuItem>
                <MenuItem value="RECEIVABLE">Receivable (Party owes you)</MenuItem>
                <MenuItem value="PAYABLE">Payable (You owe party)</MenuItem>
              </TextField>
              {errors.openingBalanceType && (
                <FormHelperText error sx={{ ml: 1.5, mt: 0.5 }}>{errors.openingBalanceType}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="creditLimit"
                type="text"
                label="Credit Limit"
                placeholder="0.00"
                value={formData.creditLimit}
                onChange={(e) => handleChange('creditLimit', e.target.value)}
                onBlur={() => handleBlur('creditLimit')}
                error={Boolean(errors.creditLimit)}
                helperText={errors.creditLimit || '0 means no credit limit'}
                inputProps={{ inputMode: 'decimal',  min: '0', step: '0.01' }}
                size="small"
                disabled={loading}
                InputProps={{
                  sx: { borderRadius: 2 },
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
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
            {loading ? 'Saving Party...' : isEdit ? 'Update Party' : 'Save Party'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default PartyForm;
