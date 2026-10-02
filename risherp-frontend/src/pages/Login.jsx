import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

/**
 * 2-Step Login Page for RISHERP
 * Step 1: Verify Security Code (verify-login)
 * Step 2: Enter Email and Password (login)
 * Fully supports both Dark and Light themes.
 */
const Login = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    verifySecurityCode,
    verifiedBusiness,
    resetVerifiedBusiness,
    isAuthenticated,
  } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Step 1: Security Code state
  const [securityCode, setSecurityCode] = useState(
    location.state?.prefillCode || ''
  );
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Step 2: Credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auto-verify if code was prefilled from registration
  useEffect(() => {
    if (location.state?.prefillCode && !verifiedBusiness) {
      handleVerifyCode(location.state.prefillCode);
    }
  }, [location.state?.prefillCode]);

  const handleVerifyCode = async (codeToVerify) => {
    const target = (codeToVerify || securityCode).trim().toUpperCase();
    if (!target) {
      setCodeError('Please enter your unique Security Code');
      return;
    }

    setCodeLoading(true);
    setCodeError('');
    try {
      await verifySecurityCode(target);
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Invalid or unrecognized Security Code');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setLoginError('Email is required');
      return;
    }
    if (!password) {
      setLoginError('Password is required');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    try {
      await login(email, password, verifiedBusiness?.businessId);
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
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
      {/* Top Bar Floating Controls */}
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
          maxWidth: 450,
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          p: { xs: 3.5, sm: 4.5 },
          boxShadow: isDark
            ? '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)'
            : '0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 1px 1px rgba(15, 23, 42, 0.04)',
          bgcolor: 'background.paper',
        }}
      >
        {/* Header Branding */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 18px -4px rgba(37, 99, 235, 0.4)',
            }}
          >
            <BusinessCenterIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
            RISHERP
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            Enterprise Resource Planning &amp; Invoicing
          </Typography>
        </Box>

        {/* STEP 1: Security Code Verification */}
        {!verifiedBusiness ? (
          <Box>
            <Box
              sx={{
                p: 2,
                mb: 3,
                bgcolor: isDark ? alpha(theme.palette.background.default, 0.7) : 'background.default',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: isDark
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: isDark ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                }}
              >
                <VpnKeyIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                  Step 1: Tenant Verification
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  Enter the unique business security code
                </Typography>
              </Box>
            </Box>

            {codeError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : undefined,
                  color: isDark ? theme.palette.error.light : undefined,
                  border: isDark ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : undefined,
                  '& .MuiAlert-icon': {
                    color: isDark ? theme.palette.error.light : undefined,
                  },
                }}
              >
                {codeError}
              </Alert>
            )}

            <TextField
              fullWidth
              size="medium"
              label="Business Security Code"
              placeholder="e.g. RISH-XXXXXX"
              value={securityCode}
              onChange={(e) => {
                setSecurityCode(e.target.value.toUpperCase());
                if (codeError) setCodeError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVerifyCode();
                }
              }}
              InputProps={{
                sx: {
                  fontFamily: 'monospace',
                  fontWeight: 750,
                  letterSpacing: 1.5,
                  borderRadius: 2.5,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={codeLoading || !securityCode.trim()}
              onClick={() => handleVerifyCode()}
              endIcon={!codeLoading && <ArrowForwardIcon />}
              sx={{
                mt: 2.75,
                py: 1.35,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.92rem',
              }}
            >
              {codeLoading ? <CircularProgress size={22} color="inherit" /> : 'Verify Application'}
            </Button>
          </Box>
        ) : (
          /* STEP 2: Credentials Login */
          <Box>
            {/* Verified Business Banner */}
            <Box
              sx={{
                p: 2,
                mb: 3,
                bgcolor: isDark
                  ? alpha(theme.palette.success.main, 0.12)
                  : alpha(theme.palette.success.main, 0.08),
                border: '1px solid',
                borderColor: isDark
                  ? alpha(theme.palette.success.main, 0.3)
                  : '#a7f3d0',
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 22 }} />
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={750}
                    sx={{ color: isDark ? '#4ade80' : '#065f46' }}
                  >
                    {verifiedBusiness.businessName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: isDark ? '#86efac' : '#047857',
                    }}
                  >
                    Verified Organization
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="text"
                onClick={resetVerifiedBusiness}
                sx={{
                  color: isDark ? '#4ade80' : theme.palette.success.main,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  p: 0.5,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Switch
              </Button>
            </Box>

            {loginError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : undefined,
                  color: isDark ? theme.palette.error.light : undefined,
                  border: isDark ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : undefined,
                  '& .MuiAlert-icon': {
                    color: isDark ? theme.palette.error.light : undefined,
                  },
                }}
              >
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleLoginSubmit} noValidate>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  InputProps={{
                    sx: { borderRadius: 2.5 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  InputProps={{
                    sx: { borderRadius: 2.5 },
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loginLoading}
                  sx={{
                    mt: 1,
                    py: 1.35,
                    borderRadius: 2.5,
                    fontWeight: 750,
                    fontSize: '0.92rem',
                  }}
                >
                  {loginLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign In to RISHERP'}
                </Button>
              </Box>
            </form>
          </Box>
        )}

        {/* Footer Link to Register */}
        <Box sx={{ textAlign: 'center', mt: 3.5, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
            Need a new business account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: isDark ? '#38bdf8' : 'primary.main',
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Register Organization
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
