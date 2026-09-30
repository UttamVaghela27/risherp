import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';
import settingsService from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';

const BusinessSettingsTab = () => {
  const theme = useTheme();
  const { hasPermission, isAdmin } = useAuth();
  const canUpdate = isAdmin() || hasPermission('SETTINGS_UPDATE') || hasPermission('BUSINESS_SETTINGS_UPDATE');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    businessName: '',
    legalName: '',
    ownerName: '',
    email: '',
    mobile: '',
    alternateMobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    website: '',
    logoUrl: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getBusinessProfile();
      if (res.success && res.data) {
        setForm({
          businessName: res.data.businessName || '',
          legalName: res.data.legalName || '',
          ownerName: res.data.ownerName || '',
          email: res.data.email || '',
          mobile: res.data.mobile || '',
          alternateMobile: res.data.alternateMobile || '',
          address: res.data.address || '',
          city: res.data.city || '',
          state: res.data.state || '',
          pincode: res.data.pincode || '',
          country: res.data.country || 'India',
          website: res.data.website || '',
          logoUrl: res.data.logoUrl || '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (!form.ownerName.trim()) {
      toast.error('Owner name is required');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!form.mobile.trim()) {
      toast.error('Mobile number is required');
      return;
    }

    try {
      setSaving(true);
      const res = await settingsService.updateBusinessProfile(form);
      if (res.success) {
        toast.success('Business profile updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update business profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file size must be less than 2 MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const res = await settingsService.uploadLogo(file);
      if (res.success && res.data) {
        setForm((prev) => ({ ...prev, logoUrl: res.data }));
        toast.success('Logo uploaded successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setUploadingLogo(true);
      const res = await settingsService.removeLogo();
      if (res.success) {
        setForm((prev) => ({ ...prev, logoUrl: '' }));
        toast.success('Logo removed successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 44, height: 44 }}>
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Business Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Company legal details, contact information, and business identity.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Logo Upload Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            p: 2.5,
            mb: 4,
            bgcolor: 'background.default',
            borderRadius: 2,
            border: '1px dashed #cbd5e1',
          }}
        >
          <Avatar
            src={form.logoUrl}
            alt={form.businessName}
            variant="rounded"
            sx={{ width: 80, height: 80, bgcolor: theme.palette.divider, border: '1px solid #cbd5e1' }}
          >
            <BusinessIcon sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Company Logo
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              Accepted formats: PNG, JPG, WebP (Max size: 2MB). Used in headers and PDF invoices.
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon />}
                disabled={!canUpdate || uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingLogo ? 'Uploading...' : form.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>

              {form.logoUrl && (
                <Tooltip title="Remove Logo">
                  <IconButton
                    color="error"
                    size="small"
                    disabled={!canUpdate || uploadingLogo}
                    onClick={handleRemoveLogo}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <form onSubmit={handleSave}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Business Name (Trade Name)"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Legal Registered Name"
                name="legalName"
                value={form.legalName}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
                helperText="Official registered entity name if different"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Owner / Contact Person"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Official Business Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Primary Mobile / Phone"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Contact Number"
                name="alternateMobile"
                value={form.alternateMobile}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Street Address / Premises"
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField
                fullWidth
                label="Postal / PIN Code"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                name="website"
                value={form.website}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
                placeholder="https://example.com"
              />
            </Grid>

            {canUpdate && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, width: '100%', gridColumn: '1 / -1' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                  sx={{ px: 3.5, py: 1, height: 42, borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusinessSettingsTab;
