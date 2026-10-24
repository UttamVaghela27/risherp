import { useState, useContext } from 'react';
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
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { ThemeContext } from '../context/ThemeContext';
import authService from '../services/authService';

/**
 * Forgot Password Page
 * User enters their registered email. Backend sends a password-reset OTP.
 * Always shows a generic success message regardless of whether the account exists.
 */
const ForgotPassword = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (val) => {
    if (!val.trim()) return 'Email address is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setLoading(true);
    setEmailError('');
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      // Always show submitted state regardless of account existence (prevents enumeration)
      setSubmitted(true);
    } catch {
      // Even on network errors, show generic message to avoid information leakage
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    navigate('/reset-password', { state: { email: email.trim().toLowerCase() } });
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
      {/* Top Controls */}
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
          maxWidth: 450,
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
              background: submitted
                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: submitted
                ? '0 8px 18px -4px rgba(22, 163, 74, 0.4)'
                : '0 8px 18px -4px rgba(124, 58, 237, 0.4)',
              transition: 'all 0.4s ease',
            }}
          >
            {submitted
              ? <CheckCircleOutlineIcon sx={{ fontSize: 30 }} />
              : <LockResetIcon sx={{ fontSize: 28 }} />}
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
            {submitted ? 'Check Your Email' : 'Forgot Password?'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontSize: '0.85rem', lineHeight: 1.6 }}>
            {submitted
              ? 'If an account exists for that email, we\'ve sent a password reset code. It expires in 10 minutes.'
              : 'Enter your registered email address and we\'ll send you a reset code.'}
          </Typography>
        </Box>

        {submitted ? (
          /* Post-submit view */
          <Box>
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: isDark ? alpha(theme.palette.info.main, 0.12) : undefined,
                border: isDark ? `1px solid ${alpha(theme.palette.info.main, 0.3)}` : undefined,
              }}
            >
              Didn&apos;t receive the email? Check your spam folder, or{' '}
              <Box
                component="span"
                onClick={() => setSubmitted(false)}
                sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
              >
                try again
              </Box>
              .
            </Alert>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleProceed}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.35,
                borderRadius: 2.5,
                fontWeight: 750,
                fontSize: '0.92rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                '&:hover': { boxShadow: '0 6px 16px rgba(124,58,237,0.45)' },
              }}
            >
              Enter Reset Code
            </Button>
          </Box>
        ) : (
          /* Email input form */
          <form onSubmit={handleSubmit} noValidate>
            {emailError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: 2,
                  bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : undefined,
                  border: isDark ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : undefined,
                }}
              >
                {emailError}
              </Alert>
            )}

            <TextField
              fullWidth
              size="medium"
              label="Registered Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              InputProps={{
                sx: { borderRadius: 2.5 },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !email.trim()}
              endIcon={!loading && <ArrowForwardIcon />}
              sx={{
                py: 1.35,
                borderRadius: 2.5,
                fontWeight: 750,
                fontSize: '0.92rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                '&:hover': { boxShadow: '0 6px 16px rgba(124,58,237,0.45)' },
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Code'}
            </Button>
          </form>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3.5, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: isDark ? '#38bdf8' : 'primary.main',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
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

export default ForgotPassword;
