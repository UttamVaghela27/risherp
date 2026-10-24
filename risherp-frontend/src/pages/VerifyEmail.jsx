import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import PinIcon from '@mui/icons-material/Pin';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { ThemeContext } from '../context/ThemeContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const OTP_EXPIRY_SECONDS = 600; // 10 minutes
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Email OTP Verification Page
 * Presented after registration. User enters the 6-digit code sent to their email.
 * Supports resend with countdown timer.
 */
const VerifyEmail = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Email is passed via navigation state from Register page
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Resend cooldown countdown
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // OTP expiry countdown
  const [expiryCountdown, setExpiryCountdown] = useState(OTP_EXPIRY_SECONDS);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // OTP expiry countdown
  useEffect(() => {
    if (expiryCountdown <= 0) return;
    const timer = setTimeout(() => setExpiryCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [expiryCountdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.verifyEmailOtp(email, otp);
      setSuccess(true);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setError('');
    try {
      await authService.resendVerificationOtp(email);
      toast.success('A new verification code has been sent to your email.');
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      setExpiryCountdown(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend. Please try again.';
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const expiryProgress = (expiryCountdown / OTP_EXPIRY_SECONDS) * 100;

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
      {/* Top Bar Controls */}
      <Box sx={{ position: 'absolute', top: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 10 }}>
        <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}>
          <IconButton
            onClick={toggleColorMode}
            size="medium"
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: 1,
              borderColor: 'divider',
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
            }}
          >
            {mode === 'dark'
              ? <LightModeOutlinedIcon fontSize="small" sx={{ color: '#f59e0b' }} />
              : <DarkModeOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          p: { xs: 3.5, sm: 4.5 },
          boxShadow: isDark
            ? '0 20px 40px -15px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.05)'
            : '0 20px 40px -15px rgba(15,23,42,0.07)',
          bgcolor: 'background.paper',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: success
                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: success
                ? '0 8px 18px -4px rgba(22, 163, 74, 0.45)'
                : '0 8px 18px -4px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.4s ease',
            }}
          >
            {success
              ? <CheckCircleOutlineIcon sx={{ fontSize: 30 }} />
              : <MarkEmailReadIcon sx={{ fontSize: 28 }} />}
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
            {success ? 'Email Verified!' : 'Verify Your Email'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontSize: '0.85rem' }}>
            {success
              ? 'Redirecting you to login…'
              : <>We sent a 6-digit code to <strong style={{ color: theme.palette.text.primary }}>{email}</strong></>}
          </Typography>
        </Box>

        {/* OTP expiry progress */}
        {!success && expiryCountdown > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Code expires in</Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: expiryCountdown < 120 ? 'error.main' : 'text.secondary' }}
              >
                {formatTime(expiryCountdown)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={expiryProgress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: expiryCountdown < 120 ? 'error.main' : 'primary.main',
                  transition: 'background-color 0.3s',
                },
              }}
            />
          </Box>
        )}

        {/* Error alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: 2,
              bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : undefined,
              border: isDark ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : undefined,
            }}
          >
            {error}
          </Alert>
        )}

        {/* OTP Input form */}
        {!success && (
          <form onSubmit={handleVerify} noValidate>
            <TextField
              fullWidth
              size="medium"
              label="6-Digit Verification Code"
              placeholder="______"
              value={otp}
              inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVerify();
                }
              }}
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  sx: { textAlign: 'center', letterSpacing: '0.4em' },
                },
                input: {
                  sx: {
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    borderRadius: 2.5,
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              InputProps={{
                sx: {
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  letterSpacing: '0.4em',
                  borderRadius: 2.5,
                  '& input': { textAlign: 'center' },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <PinIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || otp.length !== 6}
              sx={{ py: 1.35, borderRadius: 2.5, fontWeight: 750, fontSize: '0.92rem' }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify Email'}
            </Button>
          </form>
        )}

        {/* Resend section */}
        {!success && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {canResend ? (
              <Button
                variant="text"
                size="small"
                onClick={handleResend}
                disabled={resendLoading}
                startIcon={resendLoading ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
                sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'none' }}
              >
                {resendLoading ? 'Sending…' : 'Resend Verification Code'}
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                Resend available in{' '}
                <Box component="span" fontWeight={700} sx={{ color: 'text.primary' }}>
                  {resendCountdown}s
                </Box>
              </Typography>
            )}
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3.5, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
            Back to{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: isDark ? '#38bdf8' : 'primary.main',
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default VerifyEmail;
