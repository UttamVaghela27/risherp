import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * ConfirmDialog Component
 * Modern confirmation modal for Delete, Deactivate, Logout, and Critical actions.
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
  const getSeverityStyle = () => {
    switch (severity) {
      case 'error':
        return {
          icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 22, color: theme.palette.error.main }} />,
          bg: alpha(theme.palette.error.main, 0.1),
          border: alpha(theme.palette.error.main, 0.2),
          btnColor: 'error',
        };
      case 'warning':
        return {
          icon: <WarningAmberRoundedIcon sx={{ fontSize: 22, color: theme.palette.warning.main }} />,
          bg: alpha(theme.palette.warning.main, 0.05),
          border: alpha(theme.palette.warning.main, 0.2),
          btnColor: 'warning',
        };
      default:
        return {
          icon: <InfoOutlinedIcon sx={{ fontSize: 22, color: theme.palette.info.main }} />,
          bg: alpha(theme.palette.info.main, 0.1),
          border: alpha(theme.palette.info.main, 0.2),
          btnColor: 'primary',
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
          borderRadius: 3.5,
          p: 1,
          border: 1, borderColor: 'divider',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, pt: 2.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
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
        <DialogTitle sx={{ p: 0, fontWeight: 750, fontSize: '1.1rem', color: theme.palette.text.primary }}>
          {title}
        </DialogTitle>
      </Box>

      <DialogContent sx={{ px: 3, pt: 1.5, pb: 1 }}>
        <DialogContentText sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary, lineHeight: 1.5 }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 2,
            py: 0.8,
            borderColor: 'divider',
            color: theme.palette.text.secondary,
            fontWeight: 600,
            '&:hover': { bgcolor: 'background.default', borderColor: theme.palette.text.secondary },
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
            borderRadius: 2,
            px: 2.5,
            py: 0.8,
            fontWeight: 650,
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
