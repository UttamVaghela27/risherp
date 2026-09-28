import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Unauthorized (403) Page
 */
const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'error.50',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <SecurityIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
          Access Denied
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 380, mx: 'auto' }}>
          You do not have administrative permission to access this module or execute this operation. Please contact your system administrator.
        </Typography>

        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ px: 3, py: 1, borderRadius: 2 }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
