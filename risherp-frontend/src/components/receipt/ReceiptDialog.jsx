import { Dialog, DialogContent, useTheme } from '@mui/material';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ReceiptCreate from '../../pages/receipts/ReceiptCreate';
import AppDialogTitle from '../common/AppDialogTitle';
import { getDialogPaperSx } from '../../theme/theme';

const ReceiptDialog = ({ open = false, onClose, onSuccess }) => {
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
        title="Record Customer Receipt"
        subtitle="Receive payment and settle outstanding customer invoices"
        icon={<RequestQuoteOutlinedIcon sx={{ fontSize: 22 }} />}
        color="success"
        onClose={onClose}
      />
      <DialogContent sx={{ bgcolor: 'background.default', pt: 2 }}>
        <ReceiptCreate isModal onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
