import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

/**
 * Reusable Error State
 * 
 * Shows a user-friendly error message with an optional retry button.
 * Usage: <ErrorState message="Failed to load data" onRetry={() => fetchData()} />
 */
const ErrorState = ({ message = 'Something went wrong', onRetry = null }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        gap: 2,
        p: 3,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main', opacity: 0.7 }} />
      <Typography variant="h6" color="text.secondary" textAlign="center">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry} sx={{ mt: 1 }}>
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;
