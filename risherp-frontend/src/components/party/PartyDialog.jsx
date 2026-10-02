import { useState } from 'react';
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
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import toast from 'react-hot-toast';

import PartyForm from './PartyForm';
import partyService from '../../services/partyService';

/**
 * PartyDialog Component
 * Modern modal dialog for creating or editing party records (Customers, Suppliers, Both).
 */
const PartyDialog = ({
  open = false,
  party = null,
  defaultPartyType = 'CUSTOMER',
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
              bgcolor: isEdit
                ? isDark
                  ? alpha(theme.palette.warning.main, 0.2)
                  : alpha(theme.palette.warning.main, 0.1)
                : isDark
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.main, 0.1),
              color: isEdit ? 'warning.main' : 'primary.main',
              border: isDark
                ? `1px solid ${alpha(isEdit ? theme.palette.warning.main : theme.palette.primary.main, 0.3)}`
                : 'none',
            }}
          >
            {isEdit ? <EditOutlinedIcon sx={{ fontSize: 22 }} /> : <PersonAddOutlinedIcon sx={{ fontSize: 22 }} />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ lineHeight: 1.2 }}>
              {dialogTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit ? 'Update party contact, GSTIN, credit limits, and billing addresses' : 'Create new party ledger account with opening balance'}
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

      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: 'background.paper' }}>
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
