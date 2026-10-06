import { useState, useEffect } from 'react';
import { Dialog, DialogContent, useTheme } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import toast from 'react-hot-toast';

import ItemForm from './ItemForm';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';
import { DEFAULT_UNITS } from '../../utils/constants';
import AppDialogTitle from '../common/AppDialogTitle';
import { getDialogPaperSx } from '../../theme/theme';

const ItemDialog = ({ open = false, item = null, onClose, onSuccess }) => {
  const theme = useTheme();
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

  const dialogTitle = isEdit ? `Edit Item — ${item?.itemName || ''}` : 'Add New Product / Item';

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
            ? 'Update product pricing, stock, unit, and tax specifications'
            : 'Register a new SKU with opening stock, rates, and category'
        }
        icon={
          isEdit ? (
            <EditOutlinedIcon sx={{ fontSize: 22 }} />
          ) : (
            <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
          )
        }
        color={isEdit ? 'warning' : 'primary'}
        onClose={onClose}
      />

      <DialogContent sx={{ pt: 2.5 }}>
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
