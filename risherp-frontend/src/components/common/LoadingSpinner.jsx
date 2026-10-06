import { Box, CircularProgress, Typography, useTheme, alpha } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

/**
 * Reusable loading indicator — full-page mode matches Login branding.
 */
const LoadingSpinner = ({
  message = 'Loading...',
  fullScreen = false,
  fullPage = false,
}) => {
  const theme = useTheme();
  const isFullViewport = fullScreen || fullPage;
  const isDark = theme.palette.mode === 'dark';

  if (isFullViewport) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          px: 2,
          background: isDark
            ? `radial-gradient(ellipse at 50% 0%, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${theme.palette.background.default} 55%)`
            : `radial-gradient(ellipse at 50% 0%, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.default} 50%)`,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
          }}
        >
          <BusinessCenterIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}
          >
            RISHERP
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Enterprise ERP & Billing
          </Typography>
          <CircularProgress size={32} thickness={4} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 280,
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress size={40} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
