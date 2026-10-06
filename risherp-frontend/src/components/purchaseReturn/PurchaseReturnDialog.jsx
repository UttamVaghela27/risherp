import { Dialog, DialogContent, useTheme } from '@mui/material';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import PurchaseReturnCreate from '../../pages/purchaseReturn/PurchaseReturnCreate';
import AppDialogTitle from '../common/AppDialogTitle';
import { getDialogPaperSx } from '../../theme/theme';

const PurchaseReturnDialog = ({ open = false, onClose, onSuccess }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: getDialogPaperSx(theme) }}
    >
      <AppDialogTitle
        title="Create Purchase Return"
        subtitle="Return goods to supplier and adjust payable balances"
        icon={<KeyboardReturnOutlinedIcon sx={{ fontSize: 22 }} />}
        color="warning"
        onClose={onClose}
      />
      <DialogContent sx={{ bgcolor: 'background.default', pt: 2 }}>
        <PurchaseReturnCreate isModal onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseReturnDialog;
