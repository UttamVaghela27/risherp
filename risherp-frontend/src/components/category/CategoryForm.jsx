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
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

/**
 * CategoryForm Component
 * Modern modal dialog for creating or editing product categories.
 */
const CategoryForm = ({
  open = false,
  category = null,
  isEdit = false,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: isDark
                  ? alpha(theme.palette.primary.main, 0.2)
                  : alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isDark ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
              }}
            >
              {isEdit ? <EditOutlinedIcon sx={{ fontSize: 22 }} /> : <CategoryOutlinedIcon sx={{ fontSize: 22 }} />}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ lineHeight: 1.2 }}>
                {isEdit ? 'Edit Category' : 'Create New Category'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEdit ? 'Update existing product category details' : 'Add product category to classify item master'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: '24px !important', pb: 3 }}>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
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
              InputProps={{ sx: { borderRadius: 2 } }}
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
              InputProps={{ sx: { borderRadius: 2 } }}
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
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
            gap: 1.25,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > button': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              py: 0.9,
              borderColor: 'divider',
              color: 'text.secondary',
              fontWeight: 650,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 0.9,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.92rem',
            }}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;
