import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

/**
 * CategoryForm Component
 * Interactive modal dialog for creating or editing product categories.
 */
const CategoryForm = ({
  open = false,
  category = null,
  isEdit = false,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          categoryName: category.categoryName || '',
          description: category.description || '',
          status: category.status || 'ACTIVE',
        });
      } else {
        setFormData({
          categoryName: '',
          description: '',
          status: 'ACTIVE',
        });
      }
      setErrors({});
    }
  }, [open, category]);

  const validate = () => {
    const errs = {};
    if (!formData.categoryName || !formData.categoryName.trim()) {
      errs.categoryName = 'Category name is required';
    } else if (formData.categoryName.trim().length < 2) {
      errs.categoryName = 'Category name must be at least 2 characters';
    } else if (formData.categoryName.trim().length > 100) {
      errs.categoryName = 'Category name cannot exceed 100 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      categoryName: formData.categoryName.trim(),
      description: formData.description?.trim() || '',
      status: formData.status,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          border: 1, borderColor: 'divider',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
            pt: 2.5,
            px: 3,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CategoryOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Category Name *"
              placeholder="e.g. Computer Accessories, Electronics, Stationery"
              value={formData.categoryName}
              onChange={(e) => handleChange('categoryName', e.target.value)}
              error={Boolean(errors.categoryName)}
              helperText={errors.categoryName}
              fullWidth
              size="small"
              autoFocus
              disabled={loading}
            />

            <TextField
              label="Description"
              placeholder="Brief description of what this category covers..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              disabled={loading}
              helperText="Optional notes or classification details."
            />

            {isEdit && (
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                fullWidth
                size="small"
                disabled={loading}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: 1, borderColor: 'divider', gap: 1 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;
