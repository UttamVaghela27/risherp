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
  Chip,
  Tabs,
  Tab,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Loading';
import AppTable from '../../components/common/AppTable';
import FilterDrawer from '../../components/common/FilterDrawer';
import StockLedger from '../../components/stock/StockLedger';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';

/**
 * StockManagement Page — Phase 11
 *
 * Full stock management with two tabs:
 *  Tab 0: Stock Positions — current stock levels, valuation, min-stock alerts
 *  Tab 1: Stock Ledger   — chronological transaction history (IN/OUT) with filters
 */
const StockManagement = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  // --- Summary KPIs ---
  const [summary, setSummary] = useState(null);

  // --- Stock Position tab ---
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('ALL');
  const [stockStatus, setStockStatus] = useState('ALL');
  const [status, setStatus] = useState('ACTIVE');

  const loadSummary = async () => {
    try {
      const res = await itemService.getItemSummary();
      if (res?.success) setSummary(res.data);
    } catch { /* handled */ }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAllActiveCategories();
      if (res?.success) setCategories(res.data || []);
    } catch { /* handled */ }
  };

  const loadStockPositions = useCallback(async () => {
    setLoadingItems(true);
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
    } catch { /* handled */ }
    finally { setLoadingItems(false); }
  }, [page, rowsPerPage, search, categoryId, stockStatus, status]);

  useEffect(() => {
    loadSummary();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 0) loadStockPositions();
  }, [loadStockPositions, activeTab]);

  return (
    <Box>
      <PageHeader
        title="Stock Management"
        description="Monitor real-time inventory positions, stock valuations, and full movement ledger."
        breadcrumbs={[
          { label: 'Inventory' },
          { label: 'Stock', active: true },
        ]}
      />

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Products"
            value={summary?.totalItems != null ? summary.totalItems : '—'}
            icon={<Inventory2OutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
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
            subtitle="Below minimum"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Out of Stock"
            value={summary?.outOfStockCount != null ? summary.outOfStockCount : '—'}
            icon={<RemoveCircleOutlineOutlinedIcon sx={{ color: 'error.main', fontSize: 28 }} />}
            subtitle="Zero quantity"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Stock Value"
            value={
              summary?.totalStockValue != null
                ? `₹ ${Number(summary.totalStockValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : '—'
            }
            icon={<AccountBalanceWalletOutlinedIcon sx={{ color: 'secondary.main', fontSize: 28 }} />}
            subtitle="Purchase cost value"
          />
        </Grid>
      </Grid>

      {/* Modern Segmented Tabs */}
      <Box sx={{ mb: 3.5 }}>
        <Box
          sx={{
            display: 'inline-flex',
            bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : theme.palette.background.default,
            p: 0.6,
            borderRadius: 3,
            border: `1px solid ${isDark ? theme.palette.divider : theme.palette.divider}`,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{
              minHeight: 'auto',
              '& .MuiTab-root': {
                fontWeight: 650,
                textTransform: 'none',
                fontSize: '0.85rem',
                minHeight: 'auto',
                py: 0.85,
                px: 2.5,
                borderRadius: 2.5,
                color: isDark ? theme.palette.text.secondary : theme.palette.text.secondary,
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': {
                  color: isDark ? theme.palette.text.primary : theme.palette.text.primary,
                  bgcolor: isDark ? theme.palette.background.paper : theme.palette.background.paper,
                  boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                },
              },
            }}
          >
            <Tab
              icon={<WarehouseOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Stock Positions"
              id="tab-positions"
            />
            <Tab
              icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Stock Ledger"
              id="tab-ledger"
            />
          </Tabs>
        </Box>
      </Box>

      {/* TAB 0: Stock Positions */}
      {activeTab === 0 && (
        <Box>
          <FilterDrawer
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(0); }}
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

          {loadingItems ? (
            <TableSkeleton rows={rowsPerPage > 10 ? 10 : rowsPerPage} columns={8} />
          ) : (
            <AppTable
              page={page}
              rowsPerPage={rowsPerPage}
              totalElements={totalElements}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              headContent={
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 120 }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 140 }}>Current Stock</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>Minimum Stock</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 130 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 120 }}>Purchase Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>Stock Value</TableCell>
                </TableRow>
              }
            >
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6, px: 0 }}>
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
                  const isOut = currentStockVal <= 0;
                  const isLow = !isOut && currentStockVal <= minStockVal;

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        bgcolor: isOut
                          ? alpha(theme.palette.error.main, 0.04)
                          : isLow
                          ? alpha(theme.palette.warning.main, 0.04)
                          : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            bgcolor: isDark ? 'action.hover' : theme.palette.background.default,
                            color: 'primary.main',
                            px: 0.8,
                            py: 0.3,
                            borderRadius: 1,
                            border: `1px solid ${isDark ? theme.palette.divider : theme.palette.divider}`,
                          }}
                        >
                          {item.itemCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.itemName}</Typography>
                        {item.companyName && (
                          <Typography variant="caption" color="text.secondary">{item.companyName}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{item.categoryName || '—'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color={isOut ? 'error.main' : isLow ? 'warning.dark' : 'success.dark'}
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
            </AppTable>
          )}
        </Box>
      )}

      {/* TAB 1: Stock Ledger */}
      {activeTab === 1 && (
        <StockLedger />
      )}
    </Box>
  );
};

export default StockManagement;
