import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import PurchaseReturnCreate from '../../pages/purchaseReturn/PurchaseReturnCreate';

/**
 * PurchaseReturnDialog Component
 * MUI Modal dialog for creating purchase returns against a purchase invoice.
 */
const PurchaseReturnDialog = ({ open = false, onClose, onSuccess }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          maxHeight: '92vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'error.lighter',
              color: 'error.main',
            }}
          >
            <AssignmentReturnOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Create Purchase Return
          </Typography>
        </Stack>

        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
        <PurchaseReturnCreate isModal onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseReturnDialog;
