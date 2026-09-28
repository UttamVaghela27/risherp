import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryFilters from '../../components/category/CategoryFilters';
import CategoryTable from '../../components/category/CategoryTable';
import CategoryForm from '../../components/category/CategoryForm';
import categoryService from '../../services/categoryService';

/**
 * Categories Page
 * Master category directory with modal CRUD and safe deactivation protection.
 */
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Pagination & filter state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  // Modal dialog states
  const [formModal, setFormModal] = useState({
    open: false,
    category: null,
    isEdit: false,
    loading: false,
  });

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    category: null,
    loading: false,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: null,
    loading: false,
  });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories({
        page,
        size: rowsPerPage,
        search,
        status,
      });

      if (res?.success) {
        setCategories(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, status]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filters & pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(0);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPage(0);
  };

  // Form Modal Handlers
  const handleOpenCreate = () => {
    setFormModal({
      open: true,
      category: null,
      isEdit: false,
      loading: false,
    });
  };

  const handleOpenEdit = (cat) => {
    setFormModal({
      open: true,
      category: cat,
      isEdit: true,
      loading: false,
    });
  };

  const handleFormSubmit = async (formData) => {
    setFormModal((prev) => ({ ...prev, loading: true }));
    try {
      if (formModal.isEdit) {
        const res = await categoryService.updateCategory(formModal.category.id, formData);
        if (res?.success) {
          toast.success(`Category "${res.data.categoryName}" updated successfully`);
          setFormModal({ open: false, category: null, isEdit: false, loading: false });
          loadCategories();
        }
      } else {
        const res = await categoryService.createCategory(formData);
        if (res?.success) {
          toast.success(`Category "${res.data.categoryName}" created successfully`);
          setFormModal({ open: false, category: null, isEdit: false, loading: false });
          loadCategories();
        }
      }
    } catch {
      setFormModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Status Toggle Handlers
  const handleOpenToggleStatus = (cat) => {
    setStatusDialog({ open: true, category: cat, loading: false });
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusDialog.category) return;
    setStatusDialog((prev) => ({ ...prev, loading: true }));

    const newStatus = statusDialog.category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await categoryService.updateCategoryStatus(statusDialog.category.id, newStatus);
      if (res?.success) {
        toast.success(`Category marked as ${newStatus}`);
        loadCategories();
      }
    } catch {
      // Axios interceptor will show error (e.g. active items assigned guard)
    } finally {
      setStatusDialog({ open: false, category: null, loading: false });
    }
  };

  // Delete Handlers
  const handleOpenDelete = (cat) => {
    setDeleteDialog({ open: true, category: cat, loading: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.category) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await categoryService.deleteCategory(deleteDialog.category.id);
      if (res?.success) {
        toast.success('Category deleted successfully');
        loadCategories();
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setDeleteDialog({ open: false, category: null, loading: false });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Categories"
        description="Organize products into structured merchandise categories."
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Categories', active: true },
        ]}
        action={{
          label: 'Add Category',
          icon: <AddIcon />,
          variant: 'contained',
          color: 'primary',
          onClick: handleOpenCreate,
        }}
      />

      <CategoryFilters
        search={search}
        status={status}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
      />

      <CategoryTable
        categories={categories}
        loading={loading}
        totalElements={totalElements}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleOpenEdit}
        onToggleStatus={handleOpenToggleStatus}
        onDelete={handleOpenDelete}
        onAddCategory={handleOpenCreate}
      />

      {/* Create / Edit Dialog Modal */}
      <CategoryForm
        open={formModal.open}
        category={formModal.category}
        isEdit={formModal.isEdit}
        loading={formModal.loading}
        onClose={() => setFormModal({ open: false, category: null, isEdit: false, loading: false })}
        onSubmit={handleFormSubmit}
      />

      {/* Confirm Deactivation / Activation Dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.category?.status === 'ACTIVE' ? 'Deactivate Category?' : 'Activate Category?'}
        message={
          statusDialog.category?.status === 'ACTIVE'
            ? `Deactivating "${statusDialog.category?.categoryName}" will prevent new products from selecting it. (Note: Deactivation will be blocked if active items currently use this category).`
            : `Activating "${statusDialog.category?.categoryName}" will make it available for all products.`
        }
        confirmText={statusDialog.category?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmColor={statusDialog.category?.status === 'ACTIVE' ? 'warning' : 'success'}
        loading={statusDialog.loading}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setStatusDialog({ open: false, category: null, loading: false })}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Category?"
        message={`Are you sure you want to delete category "${deleteDialog.category?.categoryName}"? Deleting is blocked if items are assigned to it.`}
        confirmText="Delete Category"
        confirmColor="error"
        loading={deleteDialog.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, category: null, loading: false })}
      />
    </Box>
  );
};

export default Categories;
