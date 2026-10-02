import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import SalesReturnCreate from '../../pages/salesReturn/SalesReturnCreate';

/**
 * SalesReturnDialog Component
 * Modern modal dialog for creating sales returns against an invoice.
 */
const SalesReturnDialog = ({ open = false, onClose, onSuccess }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          maxHeight: '92vh',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          px: { xs: 2.5, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: isDark
                ? alpha(theme.palette.warning.main, 0.2)
                : alpha(theme.palette.warning.main, 0.1),
              color: 'warning.main',
              border: isDark ? `1px solid ${alpha(theme.palette.warning.main, 0.3)}` : 'none',
            }}
          >
            <AssignmentReturnOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ lineHeight: 1.2 }}>
              Create Sales Return
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Process customer return credit note and restock inventory
            </Typography>
          </Box>
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
        <SalesReturnCreate isModal onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default SalesReturnDialog;
