import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Avatar,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';
import settingsService from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';

const DATE_FORMAT_OPTIONS = [
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (17/09/2026)' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (09/17/2026)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (2026-09-17)' },
  { value: 'dd-MMM-yyyy', label: 'DD-MMM-YYYY (17-Sep-2026)' },
];

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 records per page' },
  { value: 20, label: '20 records per page' },
  { value: 50, label: '50 records per page' },
  { value: 100, label: '100 records per page' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST - Asia/Kolkata)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST - Asia/Dubai)' },
  { value: 'America/New_York', label: 'Eastern Time (ET - America/New_York)' },
  { value: 'Europe/London', label: 'British Time (BST/GMT - Europe/London)' },
];

const ApplicationSettingsTab = () => {
  const { hasPermission, isAdmin } = useAuth();
  const canUpdate = isAdmin() || hasPermission('SETTINGS_UPDATE');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    defaultDateFormat: 'dd/MM/yyyy',
    defaultCurrency: 'INR',
    defaultCurrencySymbol: '₹',
    defaultPageSize: 10,
    defaultLanguage: 'en',
    timezone: 'Asia/Kolkata',
    enableNotifications: true,
  });

  const fetchAppSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getApplicationSettings();
      if (res.success && res.data) {
        setForm({
          defaultDateFormat: res.data.defaultDateFormat || 'dd/MM/yyyy',
          defaultCurrency: res.data.defaultCurrency || 'INR',
          defaultCurrencySymbol: res.data.defaultCurrencySymbol || '₹',
          defaultPageSize: res.data.defaultPageSize || 10,
          defaultLanguage: res.data.defaultLanguage || 'en',
          timezone: res.data.timezone || 'Asia/Kolkata',
          enableNotifications: res.data.enableNotifications ?? true,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load application settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await settingsService.updateApplicationSettings(form);
      if (res.success) {
        toast.success('Application settings updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application settings');
    } finally {
      setSaving(false);
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
          <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 44, height: 44 }}>
            <TuneIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Application Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure system defaults, localization, currency formatting, and default grid pagination.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Default Date Format"
                name="defaultDateFormat"
                value={form.defaultDateFormat}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              >
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="System Timezone"
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              >
                {TIMEZONE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Currency Code"
                name="defaultCurrency"
                value={form.defaultCurrency}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
                helperText="ISO Currency code (e.g., INR, USD)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Currency Symbol"
                name="defaultCurrencySymbol"
                value={form.defaultCurrencySymbol}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
                helperText="Display prefix symbol (e.g., ₹, $)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Default Table Page Size"
                name="defaultPageSize"
                value={form.defaultPageSize}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
                helperText="Initial row count in data tables"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Default System Language"
                name="defaultLanguage"
                value={form.defaultLanguage}
                onChange={handleChange}
                disabled={!canUpdate}
                size="small"
              >
                <MenuItem value="en">English (US/UK)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.enableNotifications}
                    onChange={handleChange}
                    name="enableNotifications"
                    disabled={!canUpdate}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Enable System Notifications & Toasts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Show in-app status alerts for background activities and transaction confirmations.
                    </Typography>
                  </Box>
                }
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
                  sx={{ px: 3.5, py: 1, height: 42, borderRadius: 2 }}
                >
                  {saving ? 'Saving...' : 'Save Application Settings'}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApplicationSettingsTab;
