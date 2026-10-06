import { Dialog, DialogContent, useTheme } from '@mui/material';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PaymentCreate from '../../pages/payments/PaymentCreate';
import AppDialogTitle from '../common/AppDialogTitle';
import { getDialogPaperSx } from '../../theme/theme';

const PaymentDialog = ({ open = false, onClose, onSuccess }) => {
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
        title="Record Supplier Payment"
        subtitle="Disburse cash/bank payment and settle outstanding supplier invoices"
        icon={<PaymentsOutlinedIcon sx={{ fontSize: 22 }} />}
        color="error"
        onClose={onClose}
      />
      <DialogContent sx={{ bgcolor: 'background.default', pt: 2 }}>
        <PaymentCreate isModal onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
