import { useState, useEffect, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import ErrorState from '../components/common/ErrorState';

import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardStats from '../components/dashboard/DashboardStats';
import AdminOverviewStats from '../components/dashboard/AdminOverviewStats';
import SalesOverview from '../components/dashboard/SalesOverview';
import LowStockItems from '../components/dashboard/LowStockItems';
import CustomerOutstanding from '../components/dashboard/CustomerOutstanding';
import SupplierOutstanding from '../components/dashboard/SupplierOutstanding';

import dashboardService from '../services/dashboardService';

/**
 * Dashboard Page
 * Main command center for RISHERP: displays real-time operational KPIs,
 * sales vs purchase analytics, recent transactions, inventory alerts, and dues.
 */
const Dashboard = () => {
  const navigate = useNavigate();

  // Date range state
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({
    fromDate: todayStr,
    toDate: todayStr,
    label: 'Today',
  });

  // Data states
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [customerOutstanding, setCustomerOutstanding] = useState([]);
  const [supplierOutstanding, setSupplierOutstanding] = useState([]);
  const [adminOverview, setAdminOverview] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  /**
   * Loads all dashboard metrics in parallel using Promise.allSettled
   * so partial failures don't crash the entire screen.
   */
  const loadDashboard = useCallback(async (range = dateRange, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setHasError(false);

    try {
      const [
        summaryRes,
        salesRes,
        purchaseRes,
        lowStockRes,
        custRes,
        suppRes,
        adminRes,
      ] = await Promise.allSettled([
        dashboardService.getSummary(range.fromDate, range.toDate),
        dashboardService.getSalesOverview(range.fromDate, range.toDate),
        dashboardService.getPurchaseOverview(range.fromDate, range.toDate),
        dashboardService.getLowStock(),
        dashboardService.getCustomerOutstanding(5),
        dashboardService.getSupplierOutstanding(5),
        dashboardService.getAdminOverview(),
      ]);

      // Process summary
      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data || summaryRes.value);
      } else {
        console.error('Failed to load summary:', summaryRes.reason);
      }

      // Process sales overview
      if (salesRes.status === 'fulfilled') {
        setSalesData(salesRes.value.data || salesRes.value || []);
      }

      // Process purchase overview
      if (purchaseRes.status === 'fulfilled') {
        setPurchaseData(purchaseRes.value.data || purchaseRes.value || []);
      }

      // Process low stock
      if (lowStockRes.status === 'fulfilled') {
        setLowStock(lowStockRes.value.data || lowStockRes.value || []);
      }

      // Process customer outstanding
      if (custRes.status === 'fulfilled') {
        setCustomerOutstanding(custRes.value.data || custRes.value || []);
      }

      // Process supplier outstanding
      if (suppRes.status === 'fulfilled') {
        setSupplierOutstanding(suppRes.value.data || suppRes.value || []);
      }

      // Process admin overview
      if (adminRes.status === 'fulfilled') {
        setAdminOverview(adminRes.value.data || adminRes.value);
      }

      // Check if all failed
      if (
        summaryRes.status === 'rejected' &&
        salesRes.status === 'rejected'
      ) {
        setHasError(true);
      } else if (isRefresh) {
        toast.success('Dashboard updated');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  // Initial load
  useEffect(() => {
    loadDashboard(dateRange);
  }, []); // Run on mount

  // Handle filter preset change
  const handleFilterChange = (newRange) => {
    setDateRange(newRange);
    loadDashboard(newRange);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadDashboard(dateRange, true);
  };

  if (hasError && !summary) {
    return (
      <Box>
        <PageHeader
          title="Dashboard"
          description="Daily operational summary, revenue metrics, inventory valuation, and cash flow."
        />
        <ErrorState
          message="Failed to load dashboard metrics. Please check server connection."
          onRetry={() => loadDashboard(dateRange)}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Top Page Header */}
      <PageHeader
        title="Dashboard"
        description="Daily operational summary, revenue metrics, inventory valuation, and cash flow."
      />

      {/* Date Filter Bar & Manual Refresh */}
      <DashboardFilters
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        loading={refreshing}
      />

      {/* 8 Primary Operational & Financial Summary Cards */}
      <DashboardStats
        summary={summary}
        loading={loading}
        periodLabel={dateRange.label || 'Today'}
      />

      {/* Admin Panel Overview Cards */}
      <AdminOverviewStats
        overviewData={adminOverview}
        loading={loading}
      />

      {/* Row 3: Sales/Purchase Comparative Bar Widget + Low Stock Alert Card */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SalesOverview
            salesData={salesData}
            purchaseData={purchaseData}
            loading={loading}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <LowStockItems
            items={lowStock}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Row 4: Top Customer Receivables & Supplier Payables Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomerOutstanding
            customers={customerOutstanding}
            loading={loading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SupplierOutstanding
            suppliers={supplierOutstanding}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
