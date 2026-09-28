import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

/**
 * 404 Not Found Page
 * Shown when user navigates to a route that doesn't exist.
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
      <Typography variant="h2" fontWeight={700} color="text.primary">
        404
      </Typography>
      <Typography variant="h5" color="text.secondary">
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 2 }}>
        The page you are looking for might have been removed or is temporarily unavailable.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;
