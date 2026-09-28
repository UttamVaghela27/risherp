import { useState, useEffect } from 'react';
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import toast from 'react-hot-toast';

import ItemForm from './ItemForm';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';
import { DEFAULT_UNITS } from '../../utils/constants';

/**
 * ItemDialog Component
 * MUI Modal dialog for registering or modifying product records in the Item Master.
 */
const ItemDialog = ({
  open = false,
  item = null,
  onClose,
  onSuccess,
}) => {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(item?.id);

  useEffect(() => {
    if (open) {
      const fetchMetadata = async () => {
        try {
          const [catRes, unitRes] = await Promise.all([
            categoryService.getAllActiveCategories(),
            itemService.getUnits().catch(() => ({ success: false })),
          ]);

          if (catRes?.success) {
            setCategories(catRes.data || []);
          }
          if (unitRes?.success && unitRes.data?.length > 0) {
            setUnits(unitRes.data);
          }
        } catch {
          // Handled by Axios interceptor
        }
      };

      fetchMetadata();
    }
  }, [open]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await itemService.updateItem(item.id, formData);
        if (res?.success) {
          toast.success(`Item "${formData.itemName}" updated successfully!`);
          if (onSuccess) onSuccess(res.data);
          if (onClose) onClose();
        }
      } else {
        res = await itemService.createItem(formData);
        if (res?.success) {
          toast.success(`Item "${res.data.itemName}" created with code ${res.data.itemCode}`);
          if (onSuccess) onSuccess(res.data);
          if (onClose) onClose();
        }
      }
    } catch {
      // Axios error interceptor displays backend error message
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = isEdit
    ? `Edit Item — ${item?.itemName || ''}`
    : 'Add New Item';

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
            {isEdit ? <EditOutlinedIcon fontSize="small" /> : <Inventory2OutlinedIcon fontSize="small" />}
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
        <ItemForm
          initialValues={item}
          isEdit={isEdit}
          categories={categories}
          units={units}
          loading={submitting}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ItemDialog;
