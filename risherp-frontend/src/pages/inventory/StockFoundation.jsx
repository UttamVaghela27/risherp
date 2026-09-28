import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Grid,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Loading';
import FilterDrawer from '../../components/common/FilterDrawer';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';

/**
 * StockFoundation Page
 * Read-only inventory foundation reflecting real-time item stock balances,
 * valuation at purchase cost, and safety stock threshold indicators.
 */
const StockFoundation = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('ALL');
  const [stockStatus, setStockStatus] = useState('ALL');
  const [status, setStatus] = useState('ACTIVE');

  const loadSummary = async () => {
    try {
      const res = await itemService.getItemSummary();
      if (res?.success) {
        setSummary(res.data);
      }
    } catch {
      // Handled by Axios interceptor
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAllActiveCategories();
      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch {
      // Handled by Axios interceptor
    }
  };

  const loadStockData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemService.getItems({
        page,
        size: rowsPerPage,
        search,
        categoryId,
        stockStatus,
        status,
        sortBy: 'currentStock',
        sortDir: 'asc',
      });

      if (res?.success) {
        setItems(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, categoryId, stockStatus, status]);

  useEffect(() => {
    loadSummary();
    loadCategories();
  }, []);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        title="Stock Management"
        description="Real-time read-only inventory foundation, stock level alerts, and cost valuation."
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Stock', active: true },
        ]}
      />

      {/* Phase 6 Architecture Notice */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Inventory Foundation (Phase 6):</strong> Real-time balances reflect initial stock and item catalog baselines. Complete transactional history (Purchases, Sales, Returns) and manual stock count adjustments will be managed in <strong>Phase 12 (Stock Management)</strong>.
      </Alert>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Products"
            value={summary?.totalItems != null ? summary.totalItems : '—'}
            icon={<WarehouseOutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
            subtitle="Catalog size"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="In Stock"
            value={summary?.inStockCount != null ? summary.inStockCount : '—'}
            icon={<CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main', fontSize: 28 }} />}
            subtitle="Adequate inventory"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Low Stock"
            value={summary?.lowStockCount != null ? summary.lowStockCount : '—'}
            icon={<WarningAmberOutlinedIcon sx={{ color: 'warning.main', fontSize: 28 }} />}
            subtitle="Reorder required"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Out of Stock"
            value={summary?.outOfStockCount != null ? summary.outOfStockCount : '—'}
            icon={<RemoveCircleOutlineOutlinedIcon sx={{ color: 'error.main', fontSize: 28 }} />}
            subtitle="Critical zero stock"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Stock Value"
            value={
              summary?.totalStockValue != null
                ? `₹ ${(summary.totalStockValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : '—'
            }
            icon={<AccountBalanceWalletOutlinedIcon sx={{ color: 'secondary.main', fontSize: 28 }} />}
            subtitle="Purchase cost value"
          />
        </Grid>
      </Grid>

      {/* Filters Toolbar */}
      <FilterDrawer
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search by item name, code or barcode..."
        filterType="item"
        filterState={{ categoryId, stockStatus, status }}
        onFilterChange={(key, val) => {
          if (key === 'categoryId') setCategoryId(val);
          if (key === 'stockStatus') setStockStatus(val);
          if (key === 'status') setStatus(val);
          setPage(0);
        }}
        filterOptions={{ categories }}
        defaultFilterState={{ status: 'ACTIVE' }}
        isFiltered={search.trim() !== '' || categoryId !== 'ALL' || stockStatus !== 'ALL' || status !== 'ACTIVE'}
        onReset={() => {
          setSearch('');
          setCategoryId('ALL');
          setStockStatus('ALL');
          setStatus('ACTIVE');
          setPage(0);
        }}
        resultCount={totalElements}
        totalCount={summary?.totalItems}
        itemName="Items"
      />

      {/* Stock Table */}
      <Card sx={{ width: '100%', overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2 }}>
        {loading ? (
          <TableSkeleton rows={rowsPerPage > 10 ? 10 : rowsPerPage} columns={8} />
        ) : (
          <TableContainer sx={{ minHeight: 340 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 120 }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 140 }}>
                    Current Stock
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>
                    Minimum Stock
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 130 }}>
                    Stock Status
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 120 }}>
                    Purchase Rate
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>
                    Stock Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ p: 0 }}>
                      <EmptyState
                        title="No stock records found"
                        message="Items registered in the catalog will appear here."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const currentStockVal = item.currentStock != null ? Number(item.currentStock) : 0;
                    const minStockVal = item.minimumStock != null ? Number(item.minimumStock) : 0;

                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              bgcolor: 'background.default',
                              color: 'primary.main',
                              px: 0.8,
                              py: 0.3,
                              borderRadius: 1,
                              border: 1, borderColor: 'divider',
                            }}
                          >
                            {item.itemCode}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.itemName}
                          </Typography>
                          {item.companyName && (
                            <Typography variant="caption" color="text.secondary">
                              {item.companyName}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.categoryName || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            color={
                              currentStockVal <= 0
                                ? 'error.main'
                                : currentStockVal <= minStockVal
                                ? 'warning.dark'
                                : 'success.dark'
                            }
                          >
                            {item.currentStock} {item.unit}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {item.minimumStock} {item.unit}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <StatusChip status={item.stockStatus} />
                        </TableCell>

                        <TableCell align="right">
                          <CurrencyDisplay amount={item.purchaseRate} variant="body2" />
                        </TableCell>

                        <TableCell align="right">
                          <CurrencyDisplay
                            amount={item.stockValue}
                            variant="body2"
                            fontWeight={700}
                            color="text.primary"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Card>
    </Box>
  );
};

export default StockFoundation;
