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
  useTheme,
  alpha,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import toast from 'react-hot-toast';

/**
 * SecurityCodeModal
 * Displays the unique generated Security Code after business registration.
 * Fully optimized for both Dark and Light themes.
 */
const SecurityCodeModal = ({ open, data, onProceed }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
          borderRadius: 3.5,
          p: { xs: 1, sm: 1.5 },
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: isDark
              ? alpha(theme.palette.success.main, 0.15)
              : alpha(theme.palette.success.main, 0.1),
            color: isDark ? theme.palette.success.light : theme.palette.success.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            border: isDark ? `1px solid ${alpha(theme.palette.success.main, 0.3)}` : 'none',
          }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" fontWeight={750} color="text.primary">
          Registration Successful!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {data.businessName} has been registered successfully.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 4 }, py: 2 }}>
        <Box
          sx={{
            my: 2,
            p: { xs: 2.5, sm: 3 },
            bgcolor: isDark
              ? alpha(theme.palette.background.default, 0.9)
              : alpha(theme.palette.primary.main, 0.03),
            border: `2px dashed ${isDark ? theme.palette.primary.light : theme.palette.primary.main}`,
            borderRadius: 2.5,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <Typography
            variant="caption"
            fontWeight={650}
            color="text.secondary"
            sx={{ letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 0.5 }}
          >
            Your Unique Security Code
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
              mt: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: { xs: 1.5, sm: 3 },
                fontSize: { xs: '1.4rem', sm: '2rem' },
                fontFamily: 'monospace',
                color: isDark ? '#38bdf8' : '#0284c7',
                wordBreak: 'break-all',
              }}
            >
              {data.securityCode}
            </Typography>

            <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
              <IconButton
                onClick={handleCopy}
                size="small"
                sx={{
                  bgcolor: isDark ? alpha(theme.palette.info.main, 0.18) : '#e0f2fe',
                  color: isDark ? '#38bdf8' : '#0284c7',
                  border: isDark ? `1px solid ${alpha('#38bdf8', 0.3)}` : 'none',
                  '&:hover': {
                    bgcolor: isDark ? alpha(theme.palette.info.main, 0.3) : '#bae6fd',
                  },
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
            bgcolor: isDark ? alpha(theme.palette.warning.main, 0.15) : undefined,
            color: isDark ? theme.palette.warning.light : undefined,
            border: isDark ? `1px solid ${alpha(theme.palette.warning.main, 0.3)}` : undefined,
            '& .MuiAlert-icon': {
              color: isDark ? theme.palette.warning.light : undefined,
            },
            '& .MuiAlert-message': { fontWeight: 500 },
          }}
        >
          <strong>Save this code securely.</strong> It will be required to verify this application before entering login credentials.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 4 }, pb: 3, pt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onProceed}
          sx={{
            py: 1.4,
            borderRadius: 2.5,
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
