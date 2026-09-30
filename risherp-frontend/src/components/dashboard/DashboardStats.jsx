import React from 'react';
import { Box } from '@mui/material';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import StatCard from '../common/StatCard';

/**
 * DashboardStats Component
 * Renders the 8 primary operational and financial KPI metric cards using uniform CSS Grid.
 */
const DashboardStats = ({ summary, loading = false, periodLabel = 'Today' }) => {
  const rowGridStyle = {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(2, 1fr)',
      lg: 'repeat(4, 1fr)',
    },
    gap: 2.5,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
        <Box sx={rowGridStyle}>
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCard key={index} title="Loading..." value={null} loading={true} />
          ))}
        </Box>
        <Box sx={rowGridStyle}>
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCard key={index + 4} title="Loading..." value={null} loading={true} />
          ))}
        </Box>
      </Box>
    );
  }

  const salesGrowth = summary?.salesGrowth;
  const purchaseGrowth = summary?.purchaseGrowth;
  const receiptsGrowth = summary?.receiptsGrowth;
  const paymentsGrowth = summary?.paymentsGrowth;
  const lowStockCount = summary?.lowStockCount ?? 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
      {/* Row 1: Operational Inflow & Outflow */}
      <Box sx={rowGridStyle}>
        <StatCard
          title={`${periodLabel}'s Sales`}
          value={summary?.todaySales ?? 0}
          isCurrency
          icon={<PointOfSaleOutlinedIcon />}
          trend={salesGrowth != null ? `${salesGrowth > 0 ? '+' : ''}${salesGrowth}%` : undefined}
          trendType={salesGrowth >= 0 ? 'up' : 'down'}
          subtitle="vs previous period"
          color="primary"
        />

        <StatCard
          title={`${periodLabel}'s Purchase`}
          value={summary?.todayPurchase ?? 0}
          isCurrency
          icon={<ShoppingCartOutlinedIcon />}
          trend={purchaseGrowth != null ? `${purchaseGrowth > 0 ? '+' : ''}${purchaseGrowth}%` : undefined}
          trendType={purchaseGrowth >= 0 ? 'up' : 'down'}
          subtitle="vs previous period"
          color="info"
        />

        <StatCard
          title={`${periodLabel}'s Receipts`}
          value={summary?.todayReceipts ?? 0}
          isCurrency
          icon={<ReceiptLongOutlinedIcon />}
          trend={receiptsGrowth != null ? `${receiptsGrowth > 0 ? '+' : ''}${receiptsGrowth}%` : undefined}
          trendType={receiptsGrowth >= 0 ? 'up' : 'down'}
          subtitle="inward cash flow"
          color="success"
        />

        <StatCard
          title={`${periodLabel}'s Payments`}
          value={summary?.todayPayments ?? 0}
          isCurrency
          icon={<PaymentsOutlinedIcon />}
          trend={paymentsGrowth != null ? `${paymentsGrowth > 0 ? '+' : ''}${paymentsGrowth}%` : undefined}
          trendType={paymentsGrowth >= 0 ? 'up' : 'down'}
          subtitle="outward cash flow"
          color="warning"
        />
      </Box>

      {/* Row 2: Balances, Stock & Alerts */}
      <Box sx={rowGridStyle}>
        <StatCard
          title="Total Receivable"
          value={summary?.totalReceivable ?? 0}
          isCurrency
          icon={<AccountBalanceWalletOutlinedIcon />}
          trend="Customer Balance"
          trendType="neutral"
          subtitle="Unsettled customer dues"
          color="error"
        />

        <StatCard
          title="Total Payable"
          value={summary?.totalPayable ?? 0}
          isCurrency
          icon={<PendingActionsOutlinedIcon />}
          trend="Supplier Balance"
          trendType="neutral"
          subtitle="Unsettled vendor dues"
          color="warning"
        />

        <StatCard
          title="Stock Valuation"
          value={summary?.stockValue ?? 0}
          isCurrency
          icon={<WarehouseOutlinedIcon />}
          trend="Inventory Asset"
          trendType="up"
          subtitle="Valuation at cost price"
          color="secondary"
        />

        <StatCard
          title="Low Stock Items"
          value={`${lowStockCount} Items`}
          icon={<WarningAmberOutlinedIcon />}
          trend={lowStockCount > 0 ? 'Reorder needed' : 'All optimal'}
          trendType={lowStockCount > 0 ? 'down' : 'up'}
          subtitle={lowStockCount > 0 ? 'Below safety threshold' : 'Stock levels healthy'}
          color={lowStockCount > 0 ? 'error' : 'success'}
        />
      </Box>
    </Box>
  );
};

export default DashboardStats;
