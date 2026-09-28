import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Reusable Loading Spinner
 * 
 * Shows a centered spinner with optional message.
 * Usage: <LoadingSpinner message="Loading parties..." />
 */
const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '300px',
        gap: 2,
      }}
    >
      <CircularProgress size={44} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
