import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import toast from 'react-hot-toast';

/**
 * SecurityCodeModal
 * Displays the unique generated Security Code after business registration.
 */
const SecurityCodeModal = ({ open, data, onProceed }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    if (data.securityCode) {
      navigator.clipboard.writeText(data.securityCode);
      setCopied(true);
      toast.success('Security Code copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'success.50',
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Registration Successful!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {data.businessName} has been registered successfully.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 2 }}>
        <Box
          sx={{
            my: 2,
            p: 3,
            bgcolor: 'background.default',
            border: '2px dashed #0284c7',
            borderRadius: 2.5,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
            Your Unique Security Code
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              mt: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: 3,
                fontFamily: 'monospace',
                color: '#0369a1',
              }}
            >
              {data.securityCode}
            </Typography>

            <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
              <IconButton
                onClick={handleCopy}
                size="small"
                sx={{
                  bgcolor: '#e0f2fe',
                  color: '#0284c7',
                  '&:hover': { bgcolor: '#bae6fd' },
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Alert
          severity="warning"
          icon={<VerifiedUserIcon />}
          sx={{
            borderRadius: 2,
            fontSize: '0.875rem',
            '& .MuiAlert-message': { fontWeight: 500 },
          }}
        >
          <strong>Save this code securely.</strong> It will be required to verify this application before entering login credentials.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, pt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onProceed}
          sx={{
            py: 1.4,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Proceed to Application Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SecurityCodeModal;
