import React, { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  Divider,
  Stack,
  Paper,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import LockResetIcon from '@mui/icons-material/LockReset';
import SecurityIcon from '@mui/icons-material/Security';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const ProfilePage = () => {
  const theme = useTheme();
  const { user, permissions, isAdmin } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please enter your new password');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      if (user?.id) {
        await userService.changePassword(user.id, {
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        });
        toast.success('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error('User ID not available');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const roleName = user?.role?.name || (typeof user?.role === 'string' ? user?.role : 'ADMIN');

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="My Profile & Security"
        subtitle="Manage your identity, active business credentials, and login password"
      />

      <Grid container spacing={3}>
        {/* Left Column: User Summary Card */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              border: 1, borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 800,
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
              }}
            >
              {userInitial}
            </Avatar>

            <Typography variant="h6" fontWeight={800} color={theme.palette.text.primary}>
              {user?.name || 'Administrator'}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {user?.email || 'admin@risherp.com'}
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              <Chip
                label={roleName}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: '1px solid #bfdbfe',
                }}
              />
              <Chip
                label="ACTIVE"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: '1px solid #a7f3d0',
                }}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2} sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BusinessIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Active Business
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color={theme.palette.text.primary}>
                    {user?.businessName || 'RISHERP Enterprise'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BadgeOutlinedIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Account Type / ID
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color={theme.palette.text.primary}>
                    User #{user?.id || '1'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailOutlinedIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Primary Login Email
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color={theme.palette.text.primary}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Right Column: Password Change & Assigned Permissions */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            {/* Change Password Card */}
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                border: 1, borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color={theme.palette.text.primary} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockResetIcon color="primary" /> Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Update your login password to keep your account secure.
              </Typography>

              <form onSubmit={handlePasswordChange}>
                <Stack spacing={2}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    helperText="Must be at least 6 characters"
                  />

                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />

                  <Box sx={{ pt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1 }}
                    >
                      {submitting ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Card>

            {/* Permissions Summary Card */}
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                border: 1, borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color={theme.palette.text.primary} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" /> Security & Authorizations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isAdmin()
                  ? 'As a Super Administrator, you have full unrestricted access to all modules and operations.'
                  : `You currently have ${permissions?.length || 0} permissions granted by role "${roleName}".`}
              </Typography>

              {isAdmin() ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <strong>Super Administrator privileges active.</strong> All CRUD and management operations are enabled.
                </Alert>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 200, overflowY: 'auto' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {(permissions || []).map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: 'background.default' }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
