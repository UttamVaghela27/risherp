import { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import SecurityCodeModal from '../components/common/SecurityCodeModal';

/**
 * Business Registration Page for RISHERP
 * Fully supports Dark and Light themes.
 */
const Register = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal state for Security Code display
  const [registrationResult, setRegistrationResult] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.businessName.trim()) errs.businessName = 'Business name is required';
    if (!formData.ownerName.trim()) errs.ownerName = 'Owner name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address';
    }
    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.mobile)) {
      errs.mobile = 'Enter a valid 10-15 digit mobile number';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await register(formData);
      setRegistrationResult(data);
      setShowCodeModal(true);
    } catch {
      // Error handled by AuthContext toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToLogin = () => {
    setShowCodeModal(false);
    // Pre-fill security code on login screen via query parameter or state
    navigate('/login', {
      state: { prefillCode: registrationResult?.securityCode },
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: isDark
          ? 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 60%, #020617 100%)'
          : 'radial-gradient(ellipse at 50% 0%, #eff6ff 0%, #f8fafc 60%, #f1f5f9 100%)',
        p: { xs: 2, sm: 4 },
        transition: 'background 0.3s ease',
      }}
    >
      {/* Top Floating Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 10,
        }}
      >
        <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}>
          <IconButton
            onClick={toggleColorMode}
            size="medium"
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: 1,
              borderColor: 'divider',
              color: 'text.primary',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              },
            }}
          >
            {mode === 'dark' ? (
              <LightModeOutlinedIcon fontSize="small" sx={{ color: '#f59e0b' }} />
            ) : (
              <DarkModeOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 960,
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
          bgcolor: 'background.paper',
        }}
      >
        {/* Left Side: Brand & Feature Highlights */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            p: { xs: 4, md: 5.5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: { xs: 'none', md: '1px solid rgba(255,255,255,0.08)' },
            borderBottom: { xs: '1px solid rgba(255,255,255,0.08)', md: 'none' },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                }}
              >
                <BusinessCenterIcon sx={{ fontSize: 22, color: '#ffffff' }} />
              </Box>
              <Typography variant="h5" fontWeight={800} letterSpacing={-0.3} sx={{ color: '#ffffff' }}>
                RISHERP
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight={750} sx={{ mb: 1.5, color: '#f8fafc', letterSpacing: -0.3 }}>
              Enterprise Billing &amp; Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4, lineHeight: 1.6, fontSize: '0.875rem' }}>
              Set up your business profile to start managing inventory, high-speed POS billing, supplier ledgers, and real-time financial reporting.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {[
                'Multi-layer security with unique business security codes',
                'Real-time inventory valuation and low-stock alerts',
                'Fast POS billing with thermal print & PDF invoicing',
                'Complete party ledgers and audit security trails',
              ].map((text, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 20, color: '#38bdf8', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.825rem' }}>
              Already registered?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#38bdf8',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline', color: '#7dd3fc' },
                }}
              >
                Sign In to RISHERP
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Right Side: Registration Form */}
        <CardContent sx={{ flex: 1.2, p: { xs: 3.5, md: 5 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.4 }}>
              Register Organization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create your business account and administrator profile
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Business / Company Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  error={!!errors.businessName}
                  helperText={errors.businessName}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Owner / Contact Name"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  error={!!errors.ownerName}
                  helperText={errors.ownerName}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Business Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{
                mt: 3.5,
                py: 1.3,
                borderRadius: 2.5,
                fontWeight: 750,
                fontSize: '0.92rem',
              }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Register Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Code Modal Popup */}
      <SecurityCodeModal
        open={showCodeModal}
        data={registrationResult}
        onProceed={handleProceedToLogin}
      />
    </Box>
  );
};

export default Register;
