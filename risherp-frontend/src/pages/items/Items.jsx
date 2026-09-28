import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FilterDrawer from '../../components/common/FilterDrawer';
import ItemTable from '../../components/item/ItemTable';
import ItemDialog from '../../components/item/ItemDialog';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';

/**
 * Items Page
 * Inventory Master directory with rich filtering, KPI cards, and modal CRUD operations.
 */
const Items = () => {
  const navigate = useNavigate();

  // Data states
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter & pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('ALL');
  const [stockStatus, setStockStatus] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Item Create / Edit modal state
  const [itemDialog, setItemDialog] = useState({
    open: false,
    item: null,
  });

  // Confirmation dialog states
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    item: null,
    loading: false,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
    loading: false,
  });

  // Load inventory summary KPIs
  const loadSummary = async () => {
    try {
      const res = await itemService.getItemSummary();
      if (res?.success) {
        setSummary(res.data);
      }
    } catch {
      // Handled by axios interceptor
    }
  };

  // Load active categories for filter
  const loadCategories = async () => {
    try {
      const res = await categoryService.getAllActiveCategories();
      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch {
      // Handled by axios interceptor
    }
  };

  // Load paginated items
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemService.getItems({
        page,
        size: rowsPerPage,
        search,
        categoryId,
        stockStatus,
        status,
      });

      if (res?.success) {
        setItems(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, categoryId, stockStatus, status]);

  useEffect(() => {
    loadSummary();
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Actions
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

  const handleCategoryChange = (val) => {
    setCategoryId(val);
    setPage(0);
  };

  const handleStockStatusChange = (val) => {
    setStockStatus(val);
    setPage(0);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('ALL');
    setStockStatus('ALL');
    setStatus('ALL');
    setPage(0);
  };

  const handleView = (item) => {
    navigate(`/items/${item.id}`);
  };

  const handleOpenCreate = () => {
    setItemDialog({ open: true, item: null });
  };

  const handleEdit = (item) => {
    setItemDialog({ open: true, item });
  };

  const handleOpenToggleStatus = (item) => {
    setStatusDialog({ open: true, item, loading: false });
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusDialog.item) return;
    setStatusDialog((prev) => ({ ...prev, loading: true }));

    const newStatus = statusDialog.item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await itemService.updateItemStatus(statusDialog.item.id, newStatus);
      if (res?.success) {
        toast.success(`Item marked as ${newStatus}`);
        loadItems();
        loadSummary();
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setStatusDialog({ open: false, item: null, loading: false });
    }
  };

  const handleOpenDelete = (item) => {
    setDeleteDialog({ open: true, item, loading: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const res = await itemService.deleteItem(deleteDialog.item.id);
      if (res?.success) {
        toast.success('Item deleted successfully');
        loadItems();
        loadSummary();
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setDeleteDialog({ open: false, item: null, loading: false });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Items"
        description="Manage products, pricing and inventory information."
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Items', active: true },
        ]}
        action={{
          label: 'Add Item',
          icon: <AddIcon />,
          variant: 'contained',
          color: 'primary',
          onClick: handleOpenCreate,
        }}
      />

      {/* KPI Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Catalog"
            value={summary?.totalItems != null ? summary.totalItems : '—'}
            icon={<Inventory2OutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
            subtitle={`${summary?.activeItems || 0} active`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="In Stock"
            value={summary?.inStockCount != null ? summary.inStockCount : '—'}
            icon={<CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main', fontSize: 28 }} />}
            subtitle="Optimal levels"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Low Stock"
            value={summary?.lowStockCount != null ? summary.lowStockCount : '—'}
            icon={<WarningAmberOutlinedIcon sx={{ color: 'warning.main', fontSize: 28 }} />}
            subtitle="Needs reordering"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Out of Stock"
            value={summary?.outOfStockCount != null ? summary.outOfStockCount : '—'}
            icon={<RemoveCircleOutlineOutlinedIcon sx={{ color: 'error.main', fontSize: 28 }} />}
            subtitle="Zero inventory"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Stock Value"
            value={
              summary?.totalStockValue != null
                ? `₹ ${(summary.totalStockValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : '—'
            }
            icon={<AccountBalanceWalletOutlinedIcon sx={{ color: 'secondary.main', fontSize: 28 }} />}
            subtitle="Cost valuation"
          />
        </Grid>
      </Grid>

      {/* Filters Toolbar */}
      <FilterDrawer
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by item name, code or barcode..."
        filterType="item"
        filterState={{ categoryId, stockStatus, status }}
        onFilterChange={(key, val) => {
          if (key === 'categoryId') handleCategoryChange(val);
          if (key === 'stockStatus') handleStockStatusChange(val);
          if (key === 'status') handleStatusChange(val);
        }}
        filterOptions={{ categories }}
        isFiltered={search.trim() !== '' || categoryId !== 'ALL' || stockStatus !== 'ALL' || status !== 'ALL'}
        onReset={handleResetFilters}
        resultCount={totalElements}
        totalCount={summary?.totalItems}
        itemName="Items"
      />

      {/* Enterprise Data Table */}
      <ItemTable
        items={items}
        loading={loading}
        totalElements={totalElements}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onEdit={handleEdit}
        onToggleStatus={handleOpenToggleStatus}
        onDelete={handleOpenDelete}
        onAddItem={handleOpenCreate}
      />

      {/* Item Create / Edit Dialog Modal */}
      <ItemDialog
        open={itemDialog.open}
        item={itemDialog.item}
        onClose={() => setItemDialog({ open: false, item: null })}
        onSuccess={() => {
          loadItems();
          loadSummary();
        }}
      />

      {/* Confirm Deactivate / Activate Dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.item?.status === 'ACTIVE' ? 'Deactivate Item?' : 'Activate Item?'}
        message={
          statusDialog.item?.status === 'ACTIVE'
            ? `Deactivating "${statusDialog.item?.itemName}" will prevent it from being selected in future Sales or Purchases. Existing records remain safe.`
            : `Activating "${statusDialog.item?.itemName}" will make it immediately tradeable in Sales and Purchases.`
        }
        confirmText={statusDialog.item?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmColor={statusDialog.item?.status === 'ACTIVE' ? 'warning' : 'success'}
        loading={statusDialog.loading}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setStatusDialog({ open: false, item: null, loading: false })}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Item Record?"
        message={`Are you sure you want to delete "${deleteDialog.item?.itemName}"? If this item is needed later, deactivating it is safer.`}
        confirmText="Delete Item"
        confirmColor="error"
        loading={deleteDialog.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, item: null, loading: false })}
      />
    </Box>
  );
};

export default Items;
