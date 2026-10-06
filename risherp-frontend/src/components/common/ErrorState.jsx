import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

const ErrorState = ({
  title = 'Unable to load data',
  message = 'Something went wrong while fetching data. Please try again.',
  onRetry = null,
  minHeight = 280,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        p: 4,
        textAlign: 'center',
        border: `1px dashed ${alpha(theme.palette.error.main, 0.35)}`,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.12 : 0.07),
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <ErrorOutlineOutlinedIcon
          sx={{
            fontSize: 34,
            color: alpha(theme.palette.error.main, 0.7),
          }}
        />
      </Box>

      <Typography variant="subtitle1" fontWeight={650} color="text.primary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, lineHeight: 1.6 }}>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<RefreshIcon fontSize="small" />}
          onClick={onRetry}
          sx={{ mt: 2.5 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;
