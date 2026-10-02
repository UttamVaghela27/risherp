import { useState, useEffect } from 'react';
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import toast from 'react-hot-toast';

import ItemForm from './ItemForm';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';
import { DEFAULT_UNITS } from '../../utils/constants';

/**
 * ItemDialog Component
 * Modern modal dialog for registering or modifying product records in Item Master.
 */
const ItemDialog = ({
  open = false,
  item = null,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    : 'Add New Product / Item';

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
            {isEdit ? <EditOutlinedIcon sx={{ fontSize: 22 }} /> : <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ lineHeight: 1.2 }}>
              {dialogTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit ? 'Update product pricing, stock, unit, and tax specifications' : 'Register a new SKU with opening stock, rates, and category'}
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
