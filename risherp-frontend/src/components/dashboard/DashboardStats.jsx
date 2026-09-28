import { Grid } from '@mui/material';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import StatCard from '../common/StatCard';
import { CardSkeleton } from '../common/Loading';

/**
 * DashboardStats Component
 * Renders the 8 primary operational and financial KPI metric cards.
 */
const DashboardStats = ({ summary, loading = false, periodLabel = 'Today' }) => {
  if (loading) {
    return (
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <CardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  const salesGrowth = summary?.salesGrowth;
  const purchaseGrowth = summary?.purchaseGrowth;
  const receiptsGrowth = summary?.receiptsGrowth;
  const paymentsGrowth = summary?.paymentsGrowth;
  const lowStockCount = summary?.lowStockCount ?? 0;

  return (
    <BoxWrapper>
      {/* Row 1: Operational Inflow & Outflow */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>
      </Grid>

      {/* Row 2: Balances, Stock & Alerts */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Low Stock Items"
            value={`${lowStockCount} Items`}
            icon={<WarningAmberOutlinedIcon />}
            trend={lowStockCount > 0 ? 'Reorder needed' : 'All optimal'}
            trendType={lowStockCount > 0 ? 'down' : 'up'}
            subtitle={lowStockCount > 0 ? 'Below safety threshold' : 'Stock levels healthy'}
            color={lowStockCount > 0 ? 'error' : 'success'}
          />
        </Grid>
      </Grid>
    </BoxWrapper>
  );
};

// Simple fragment wrapper
const BoxWrapper = ({ children }) => <>{children}</>;

export default DashboardStats;
