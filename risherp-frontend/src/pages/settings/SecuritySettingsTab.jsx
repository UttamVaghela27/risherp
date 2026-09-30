import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Avatar,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/Key';
import { useNavigate } from 'react-router-dom';
import settingsService from '../../services/settingsService';

const SecuritySettingsTab = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState(null);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        setLoading(true);
        const res = await settingsService.getSecuritySettings();
        if (res.success && res.data) {
          setSecurityData(res.data);
        }
      } catch (err) {
        console.error('Failed to load security parameters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurity();
  }, []);

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
            <ShieldIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              System Security & Access Controls
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review authentication policies, token lifecycles, and cryptographic standards.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          {/* Token Policy */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <KeyIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Session & JWT Authentication
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Token Expiration Lifecycle:
                  </Typography>
                  <Chip
                    label={securityData?.tokenExpirationFormatted || '24 hours'}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Signing Algorithm:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    HMAC-SHA256 (256-bit)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Revocation Mechanism:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Stateless Bearer + Active User Filter
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Password Policy */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <LockIcon color="secondary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Password & Identity Policy
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Minimum Password Length:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {securityData?.minPasswordLength || 6} characters
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Storage Hashing:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    BCrypt (10 rounds)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Inactive User Check:
                  </Typography>
                  <Chip label="Enforced on Request" color="success" size="small" variant="outlined" />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* User Role & Change Password CTA */}
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Need to update your login password?
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ensure your account uses a secure password to protect company ERP access.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                onClick={() => navigate('/profile')}
              >
                Go to Profile & Password
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsTab;
