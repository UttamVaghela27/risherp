import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import PageHeader from '../components/common/PageHeader';

/**
 * ComingSoon Component
 * Standard placeholder view for modules slated for subsequent development phases.
 */
const ComingSoon = ({ title = 'Module', description = 'Module development roadmap', phase = 'Future Phase' }) => {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader
        title={title}
        description={description}
        action={{
          label: 'Dashboard',
          icon: <ArrowBackIcon />,
          variant: 'outlined',
          onClick: () => navigate('/dashboard'),
        }}
      />

      <Card sx={{ textAlign: 'center', py: 8, px: 3, border: '1px dashed #cbd5e1' }}>
        <CardContent sx={{ maxWidth: 500, mx: 'auto' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.50',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <ConstructionOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
            {title} Module
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            The UI Shell and navigation routes for <strong>{title}</strong> are active. Business logic, tables, dialogs, and database APIs will be fully implemented in <strong>{phase}</strong>.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ px: 3, py: 1 }}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComingSoon;
