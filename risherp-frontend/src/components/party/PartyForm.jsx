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
  FormHelperText,
  Alert,
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
 * Comprehensive structured form for creating or updating Party records.
 */
const PartyForm = ({
  initialValues = null,
  isEdit = false,
  onSubmit,
  onCancel,
  loading = false,
  defaultPartyType = 'CUSTOMER',
}) => {
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

  // Handle field change
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Automatic balance type default according to party type (only if user hasn't explicitly set to NONE or non-zero)
      if (field === 'partyType') {
        if (value === 'CUSTOMER' && updated.openingBalanceType === 'PAYABLE') {
          updated.openingBalanceType = 'RECEIVABLE';
        } else if (value === 'SUPPLIER' && updated.openingBalanceType === 'RECEIVABLE') {
          updated.openingBalanceType = 'PAYABLE';
        }
      }

      // If opening balance is 0, auto-default type to NONE; if changed from 0 to > 0, set to logical default
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

    // Clear field error on edit
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
        if (value && value.trim() && !/^[1-9][0-9]{5}$/.test(value.trim())) {
          error = 'Please enter a valid 6-digit Indian PIN code.';
        }
        break;

      case 'openingBalance':
        const ob = parseFloat(value);
        if (isNaN(ob) || ob < 0) {
          error = 'Opening balance cannot be negative.';
        }
        break;

      case 'creditLimit':
        const cl = parseFloat(value);
        if (isNaN(cl) || cl < 0) {
          error = 'Credit limit cannot be negative.';
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    const numBal = parseFloat(formData.openingBalance) || 0;
    if (numBal > 0 && formData.openingBalanceType === 'NONE') {
      newErrors.openingBalanceType = 'Opening balance > 0 requires Receivable or Payable.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
        {/* Section 1: Party Information */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
              <BusinessIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={750} color="text.primary">
                Party Information
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
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
                  helperText={errors.partyName || 'The legal trade name or registered business name'}
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
                >
                  <MenuItem value="CUSTOMER">Customer (Buyer)</MenuItem>
                  <MenuItem value="SUPPLIER">Supplier (Vendor)</MenuItem>
                  <MenuItem value="BOTH">Both (Customer & Supplier)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Contact Information */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
              <ContactPhoneOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={750} color="text.primary">
                Contact Information
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
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
                  helperText={errors.mobile || '10-digit primary mobile number for billing & SMS'}
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
                  helperText={errors.email || 'Used for e-invoices and account statements'}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 3: Address Information */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
              <PlaceOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={750} color="text.primary">
                Address Details
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
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
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 4: Financial Information */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
              <AccountBalanceWalletOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={750} color="text.primary">
                Financial Information
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  id="openingBalance"
                  type="number"
                  label="Opening Balance (₹)"
                  value={formData.openingBalance}
                  onChange={(e) => handleChange('openingBalance', e.target.value)}
                  onBlur={() => handleBlur('openingBalance')}
                  error={Boolean(errors.openingBalance)}
                  helperText={errors.openingBalance || 'Initial outstanding balance'}
                  inputProps={{ min: '0', step: '0.01' }}
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
                  disabled={parseFloat(formData.openingBalance) === 0}
                  error={Boolean(errors.openingBalanceType)}
                >
                  <MenuItem value="NONE">None (₹0.00 Balance)</MenuItem>
                  <MenuItem value="RECEIVABLE">Receivable (Party owes you money)</MenuItem>
                  <MenuItem value="PAYABLE">Payable (You owe party money)</MenuItem>
                </TextField>
                {errors.openingBalanceType && (
                  <FormHelperText error>{errors.openingBalanceType}</FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  id="creditLimit"
                  type="number"
                  label="Credit Limit (₹)"
                  value={formData.creditLimit}
                  onChange={(e) => handleChange('creditLimit', e.target.value)}
                  onBlur={() => handleBlur('creditLimit')}
                  error={Boolean(errors.creditLimit)}
                  helperText={errors.creditLimit || 'Maximum credit threshold (0 = No limit)'}
                  inputProps={{ min: '0', step: '0.01' }}
                />
              </Grid>

              {/* Financial guidance alert */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ fontSize: '0.8125rem', py: 0.5, borderRadius: 1.5 }}>
                  <strong>Receivable:</strong> Customer owes money to your business. &nbsp;|&nbsp;{' '}
                  <strong>Payable:</strong> Your business owes money to this vendor/party.
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 5: Other & Status */}
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
              <NotesOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={750} color="text.primary">
                Additional Notes & Status
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  id="notes"
                  label="Internal Notes / Terms"
                  placeholder="e.g. 15 days payment terms, GST exempt, special transport instructions"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  required
                  id="status"
                  label="Operational Status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="ACTIVE">Active (Enabled for billing)</MenuItem>
                  <MenuItem value="INACTIVE">Inactive (Disabled / Archived)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Form Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1, pb: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseOutlinedIcon />}
            onClick={onCancel}
            disabled={loading}
            sx={{ px: 3, borderRadius: 1.5, borderColor: 'divider' }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
            disabled={loading}
            sx={{ px: 3.5, borderRadius: 1.5 }}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Party' : 'Save Party'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default PartyForm;
