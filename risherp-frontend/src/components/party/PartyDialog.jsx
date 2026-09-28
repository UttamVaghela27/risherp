import { useState } from 'react';
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
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import toast from 'react-hot-toast';

import PartyForm from './PartyForm';
import partyService from '../../services/partyService';

/**
 * PartyDialog Component
 * MUI Modal dialog for creating or editing party records (Customers, Suppliers, Both).
 */
const PartyDialog = ({
  open = false,
  party = null,
  defaultPartyType = 'CUSTOMER',
  onClose,
  onSuccess,
}) => {
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(party?.id);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      let res;
      if (isEdit) {
        res = await partyService.updateParty(party.id, formData);
        if (res?.success) {
          toast.success(`Party "${formData.partyName}" updated successfully!`);
          if (onSuccess) onSuccess(res.data);
          if (onClose) onClose();
        }
      } else {
        res = await partyService.createParty(formData);
        if (res?.success) {
          toast.success(`Party "${formData.partyName}" created successfully!`);
          if (onSuccess) onSuccess(res.data);
          if (onClose) onClose();
        }
      }
    } catch {
      // Errors handled by Axios interceptor
    } finally {
      setSaving(false);
    }
  };

  const dialogTitle = isEdit
    ? `Edit Party — ${party?.partyName || ''}`
    : defaultPartyType === 'CUSTOMER'
    ? 'Add New Customer'
    : defaultPartyType === 'SUPPLIER'
    ? 'Add New Supplier'
    : 'Add New Party';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          maxHeight: '90vh',
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
              bgcolor: isEdit ? 'warning.lighter' : 'primary.lighter',
              color: isEdit ? 'warning.main' : 'primary.main',
            }}
          >
            {isEdit ? <EditOutlinedIcon fontSize="small" /> : <PersonAddOutlinedIcon fontSize="small" />}
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {dialogTitle}
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
        <PartyForm
          initialValues={party}
          isEdit={isEdit}
          defaultPartyType={party?.partyType || defaultPartyType}
          loading={saving}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PartyDialog;
