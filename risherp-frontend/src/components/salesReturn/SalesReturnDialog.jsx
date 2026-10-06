import { Dialog, DialogContent, useTheme } from '@mui/material';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import SalesReturnCreate from '../../pages/salesReturn/SalesReturnCreate';
import AppDialogTitle from '../common/AppDialogTitle';
import { getDialogPaperSx } from '../../theme/theme';

const SalesReturnDialog = ({ open = false, onClose, onSuccess }) => {
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
        title="Create Sales Return"
        subtitle="Process customer return credit note and restock inventory"
        icon={<AssignmentReturnOutlinedIcon sx={{ fontSize: 22 }} />}
        color="warning"
        onClose={onClose}
      />
      <DialogContent sx={{ bgcolor: 'background.default', pt: 2 }}>
        <SalesReturnCreate isModal onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default SalesReturnDialog;
