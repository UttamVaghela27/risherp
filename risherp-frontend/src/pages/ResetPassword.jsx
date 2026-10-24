import { useState, useEffect, useContext } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import PinIcon from '@mui/icons-material/Pin';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockResetIcon from '@mui/icons-material/LockReset';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { ThemeContext } from '../context/ThemeContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const OTP_EXPIRY_SECONDS = 600;
const RESEND_COOLDOWN_SECONDS = 60;

const STEPS = ['Enter Reset Code', 'Set New Password'];

/**
 * Reset Password Page — multi-step:
 * Step 0: Enter the 6-digit OTP received by email → receive resetToken
 * Step 1: Enter and confirm new password
 * Step 2: Success confirmation
 */
const ResetPassword = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [emailError, setEmailError] = useState('');

  // Step tracking: 0 = OTP, 1 = new password, 2 = done
  const [activeStep, setActiveStep] = useState(0);

  // Step 0 state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Step 1 state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Timers
  const [expiryCountdown, setExpiryCountdown] = useState(OTP_EXPIRY_SECONDS);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Redirect if no email
  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password', { replace: true });
    }
  }, [emailFromState, navigate]);

  // OTP expiry countdown
  useEffect(() => {
    if (activeStep !== 0 || expiryCountdown <= 0) return;
    const t = setTimeout(() => setExpiryCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [expiryCountdown, activeStep]);

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // ── Step 0: Verify OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Valid email required'); return; }
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await authService.verifyResetOtp(email.trim().toLowerCase(), otp);
      setResetToken(res.data?.resetToken);
      setActiveStep(1);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Incorrect or expired code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setOtpError('');
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      toast.success('A new reset code has been sent to your email.');
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      setExpiryCountdown(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setOtp('');
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Step 1: Reset Password ───────────────────────────────────────────────
  const validatePassword = () => {
    if (!newPassword) return 'New password is required';
    if (newPassword.length < 6) return 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    const err = validatePassword();
    if (err) { setPasswordError(err); return; }

    setResetLoading(true);
    setPasswordError('');
    try {
      await authService.resetPassword(
        email.trim().toLowerCase(),
        resetToken,
        newPassword,
        confirmPassword
      );
      setActiveStep(2);
      toast.success('Password reset successfully!');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setResetLoading(false);
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
      }}
    >
      {/* Theme toggle */}
      <Box sx={{ position: 'absolute', top: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 10 }}>
        <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}>
          <IconButton
            onClick={toggleColorMode}
            size="medium"
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: 1, borderColor: 'divider', backdropFilter: 'blur(8px)',
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
          width: '100%', maxWidth: 480,
          borderRadius: 4, border: 1, borderColor: 'divider',
          p: { xs: 3.5, sm: 4.5 },
          boxShadow: isDark
            ? '0 20px 40px -15px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.05)'
            : '0 20px 40px -15px rgba(15,23,42,0.07)',
          bgcolor: 'background.paper',
        }}
      >
        {/* Icon + Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              background: activeStep === 2
                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: activeStep === 2
                ? '0 8px 18px -4px rgba(22,163,74,0.4)'
                : '0 8px 18px -4px rgba(124,58,237,0.4)',
              transition: 'all 0.4s ease',
            }}
          >
            {activeStep === 2
              ? <CheckCircleOutlineIcon sx={{ fontSize: 30 }} />
              : <LockResetIcon sx={{ fontSize: 28 }} />}
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
            {activeStep === 2 ? 'Password Reset!' : 'Reset Password'}
          </Typography>
          {activeStep < 2 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
              {activeStep === 0
                ? 'Enter the reset code sent to your email'
                : 'Choose a new secure password for your account'}
            </Typography>
          )}
        </Box>

        {/* Stepper */}
        {activeStep < 2 && (
          <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* ── Step 0: OTP Entry ── */}
        {activeStep === 0 && (
          <form onSubmit={handleVerifyOtp} noValidate>
            {/* Email field if not pre-filled */}
            {!emailFromState && (
              <TextField
                fullWidth size="small" label="Your Email Address" type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                error={!!emailError} helperText={emailError}
                sx={{ mb: 2 }}
              />
            )}

            {/* Expiry progress */}
            {expiryCountdown > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Code expires in</Typography>
                  <Typography variant="caption" fontWeight={700}
                    sx={{ color: expiryCountdown < 120 ? 'error.main' : 'text.secondary' }}>
                    {formatTime(expiryCountdown)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate" value={expiryProgress}
                  sx={{
                    height: 4, borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: expiryCountdown < 120 ? 'error.main' : '#7c3aed',
                    },
                  }}
                />
              </Box>
            )}

            {otpError && (
              <Alert severity="error" sx={{
                mb: 2, borderRadius: 2,
                bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : undefined,
                border: isDark ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : undefined
              }}>
                {otpError}
              </Alert>
            )}

            <TextField
              fullWidth size="medium" label="6-Digit Reset Code" placeholder="______"
              value={otp}
              inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
                if (otpError) setOtpError('');
              }}
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  sx: { textAlign: 'center', letterSpacing: '0.4em' },
                },
                input: {
                  sx: { fontFamily: 'monospace', fontWeight: 800, fontSize: '1.5rem', borderRadius: 2.5 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              InputProps={{
                sx: { fontFamily: 'monospace', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.4em', borderRadius: 2.5, '& input': { textAlign: 'center' } },
                startAdornment: (
                  <InputAdornment position="start">
                    <PinIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={otpLoading || otp.length !== 6}
              endIcon={!otpLoading && <ArrowForwardIcon />}
              sx={{
                py: 1.35, borderRadius: 2.5, fontWeight: 750, fontSize: '0.92rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                '&:hover': { boxShadow: '0 6px 16px rgba(124,58,237,0.45)' },
              }}
            >
              {otpLoading ? <CircularProgress size={22} color="inherit" /> : 'Verify Code'}
            </Button>

            {/* Resend */}
            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
              {canResend ? (
                <Button variant="text" size="small" onClick={handleResend} disabled={resendLoading}
                  startIcon={resendLoading ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
                  sx={{ fontWeight: 700, textTransform: 'none', color: '#7c3aed' }}>
                  {resendLoading ? 'Sending…' : 'Resend Code'}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                  Resend in <Box component="span" fontWeight={700} sx={{ color: 'text.primary' }}>{resendCountdown}s</Box>
                </Typography>
              )}
            </Box>
          </form>
        )}

        {/* ── Step 1: New Password ── */}
        {activeStep === 1 && (
          <form onSubmit={handleResetPassword} noValidate>
            {passwordError && (
              <Alert severity="error" sx={{
                mb: 2.5, borderRadius: 2,
                bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : undefined,
                border: isDark ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : undefined
              }}>
                {passwordError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth size="small" label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                InputProps={{
                  sx: { borderRadius: 2.5 },
                  startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowNew((p) => !p)} edge="end" sx={{ color: 'text.secondary' }}>
                        {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth size="small" label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                InputProps={{
                  sx: { borderRadius: 2.5 },
                  startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} edge="end" sx={{ color: 'text.secondary' }}>
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={resetLoading || !newPassword || !confirmPassword}
                endIcon={!resetLoading && <CheckCircleOutlineIcon />}
                sx={{
                  py: 1.35, borderRadius: 2.5, fontWeight: 750, fontSize: '0.92rem',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                  '&:hover': { boxShadow: '0 6px 16px rgba(124,58,237,0.45)' },
                }}
              >
                {resetLoading ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
              </Button>
            </Box>
          </form>
        )}

        {/* ── Step 2: Success ── */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </Alert>
            <Button
              fullWidth variant="contained" size="large"
              onClick={() => navigate('/login', { replace: true })}
              sx={{ py: 1.35, borderRadius: 2.5, fontWeight: 750, fontSize: '0.92rem' }}
            >
              Go to Sign In
            </Button>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3.5, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
          <Link
            component={RouterLink} to="/login"
            sx={{
              color: isDark ? '#38bdf8' : 'primary.main',
              fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to Sign In
          </Link>
        </Box>
      </Card>
    </Box>
  );
};

export default ResetPassword;
