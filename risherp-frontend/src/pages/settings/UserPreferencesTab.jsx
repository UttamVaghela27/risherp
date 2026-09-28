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
  RadioGroup,
  Radio,
  Paper,
  useTheme
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SaveIcon from '@mui/icons-material/Save';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import toast from 'react-hot-toast';
import settingsService from '../../services/settingsService';

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month (Default)' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'this_financial_year', label: 'This Financial Year' },
];

const UserPreferencesTab = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    defaultDashboardDateRange: 'this_month',
    defaultPageSize: 10,
  });

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getUserPreferences();
      if (res.success && res.data) {
        setForm({
          theme: res.data.theme || 'light',
          sidebarCollapsed: res.data.sidebarCollapsed ?? false,
          defaultDashboardDateRange: res.data.defaultDashboardDateRange || 'this_month',
          defaultPageSize: res.data.defaultPageSize || 10,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user preferences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
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
      const res = await settingsService.updateUserPreferences(form);
      if (res.success) {
        toast.success('Preferences saved successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update preferences');
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
          <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 44, height: 44 }}>
            <PersonOutlinedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Personal User Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personalize your workspace experience. These settings apply only to your logged-in account.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            {/* UI Theme */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Interface Theme
              </Typography>
              <RadioGroup
                row
                name="theme"
                value={form.theme}
                onChange={handleChange}
                sx={{ gap: 2 }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderColor: form.theme === 'light' ? 'primary.main' : theme.palette.divider,
                    bgcolor: form.theme === 'light' ? '#f0fdf4' : 'transparent',
                  }}
                  onClick={() => setForm((p) => ({ ...p, theme: 'light' }))}
                >
                  <FormControlLabel
                    value="light"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LightModeIcon color="warning" />
                        <Typography variant="body2" fontWeight={600}>
                          Light Theme
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderColor: form.theme === 'dark' ? 'primary.main' : theme.palette.divider,
                    bgcolor: form.theme === 'dark' ? theme.palette.background.default : 'transparent',
                  }}
                  onClick={() => setForm((p) => ({ ...p, theme: 'dark' }))}
                >
                  <FormControlLabel
                    value="dark"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DarkModeIcon color="primary" />
                        <Typography variant="body2" fontWeight={600}>
                          Dark Theme (Experimental)
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </Grid>

            {/* Sidebar Default State */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.sidebarCollapsed}
                    onChange={handleChange}
                    name="sidebarCollapsed"
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Default Sidebar to Mini Collapsed Mode
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Collapse the sidebar automatically on desktop to maximize table screen area.
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {/* Default Dashboard Filter */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Default Dashboard Date Range"
                name="defaultDashboardDateRange"
                value={form.defaultDashboardDateRange}
                onChange={handleChange}
                size="small"
                helperText="Preferred time horizon loaded upon opening the ERP dashboard"
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Preferred Page Size */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Preferred Table Page Size"
                name="defaultPageSize"
                value={form.defaultPageSize}
                onChange={handleChange}
                size="small"
                helperText="Default row count when viewing party, item, and sales lists"
              >
                <MenuItem value={10}>10 rows per page</MenuItem>
                <MenuItem value={20}>20 rows per page</MenuItem>
                <MenuItem value={50}>50 rows per page</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ px: 3, py: 1 }}
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserPreferencesTab;
