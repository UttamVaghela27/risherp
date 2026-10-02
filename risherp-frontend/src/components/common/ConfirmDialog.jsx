import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

/**
 * ConfirmDialog Component
 * Modern, executive confirmation modal for Delete, Deactivate, Logout, and Critical actions.
 * Supports both Light and Dark themes seamlessly.
 */
const ConfirmDialog = ({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getSeverityStyle = () => {
    switch (severity) {
      case 'error':
      case 'danger':
        return {
          icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 24, color: 'error.main' }} />,
          bg: isDark ? alpha(theme.palette.error.main, 0.18) : alpha(theme.palette.error.main, 0.1),
          border: isDark ? alpha(theme.palette.error.main, 0.35) : alpha(theme.palette.error.main, 0.25),
          btnColor: 'error',
          btnBg: undefined,
        };
      case 'warning':
        return {
          icon: <WarningAmberRoundedIcon sx={{ fontSize: 24, color: 'warning.main' }} />,
          bg: isDark ? alpha(theme.palette.warning.main, 0.18) : alpha(theme.palette.warning.main, 0.1),
          border: isDark ? alpha(theme.palette.warning.main, 0.35) : alpha(theme.palette.warning.main, 0.25),
          btnColor: 'warning',
          btnBg: undefined,
        };
      case 'info':
        return {
          icon: <InfoOutlinedIcon sx={{ fontSize: 24, color: 'info.main' }} />,
          bg: isDark ? alpha(theme.palette.info.main, 0.18) : alpha(theme.palette.info.main, 0.1),
          border: isDark ? alpha(theme.palette.info.main, 0.35) : alpha(theme.palette.info.main, 0.25),
          btnColor: 'info',
          btnBg: undefined,
        };
      default:
        return {
          icon: <HelpOutlineOutlinedIcon sx={{ fontSize: 24, color: 'primary.main' }} />,
          bg: isDark ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.primary.main, 0.1),
          border: isDark ? alpha(theme.palette.primary.main, 0.35) : alpha(theme.palette.primary.main, 0.25),
          btnColor: 'primary',
          btnBg: undefined,
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          p: 0.5,
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 3,
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: style.bg,
              border: `1px solid ${style.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {style.icon}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 750,
              fontSize: '1.125rem',
              color: 'text.primary',
              letterSpacing: '-0.015em',
            }}
          >
            {title}
          </Typography>
        </Box>

        <IconButton
          onClick={onCancel}
          disabled={loading}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
        <DialogContentText
          sx={{
            fontSize: '0.9rem',
            color: 'text.secondary',
            lineHeight: 1.6,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1.5,
          gap: 1.25,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          '& > button': { width: { xs: '100%', sm: 'auto' } },
        }}
      >
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 0.9,
            borderColor: 'divider',
            color: 'text.secondary',
            fontWeight: 650,
            textTransform: 'none',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderColor: 'text.primary',
              color: 'text.primary',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={style.btnColor}
          autoFocus
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 0.9,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.92rem',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
