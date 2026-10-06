import { useState } from 'react';
import { Dialog, DialogContent, useTheme } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import toast from 'react-hot-toast';

import PartyForm from './PartyForm';
import partyService from '../../services/partyService';
import AppDialogTitle from '../common/AppDialogTitle';
import { getDialogPaperSx } from '../../theme/theme';

const PartyDialog = ({
  open = false,
  party = null,
  defaultPartyType = 'CUSTOMER',
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
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
    : 'Add New Party / Account';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: getDialogPaperSx(theme) }}
    >
      <AppDialogTitle
        title={dialogTitle}
        subtitle={
          isEdit
            ? 'Update party contact, GSTIN, credit limits, and billing addresses'
            : 'Create new party ledger account with opening balance'
        }
        icon={
          isEdit ? (
            <EditOutlinedIcon sx={{ fontSize: 22 }} />
          ) : (
            <PersonAddOutlinedIcon sx={{ fontSize: 22 }} />
          )
        }
        color={isEdit ? 'warning' : 'primary'}
        onClose={onClose}
      />

      <DialogContent sx={{ pt: 2.5 }}>
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
