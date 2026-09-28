import { Grid, Skeleton, Card, CardContent, Box } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import StatCard from '../common/StatCard';

/**
 * PurchaseSummaryCards Component
 * 4 authoritative KPI metrics cards for Purchase History:
 * - Total Invoices
 * - Total Purchases
 * - Total Paid
 * - Total Outstanding
 */
const PurchaseSummaryCards = ({ summary, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[...Array(4)].map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', p: 0.5 }}>
              <CardContent sx={{ p: 2.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Skeleton variant="text" width={100} height={20} />
                  <Skeleton variant="circular" width={36} height={36} />
                </Box>
                <Skeleton variant="text" width={120} height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={80} height={16} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const totalInvoices = summary?.totalInvoices != null ? summary.totalInvoices : 0;
  const totalPurchases = summary?.totalPurchases ?? summary?.totalPurchasesAmount ?? 0;
  const totalPaid = summary?.totalPaid ?? 0;
  const totalOutstanding = summary?.totalOutstanding ?? summary?.totalBalance ?? 0;

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Invoices"
          value={totalInvoices}
          icon={<ReceiptLongOutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
          color="primary"
          subtitle={`Bills recorded`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Purchases"
          value={totalPurchases}
          isCurrency
          icon={<ShoppingCartOutlinedIcon sx={{ color: 'info.main', fontSize: 28 }} />}
          color="info"
          subtitle="Procurement expenditure"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Paid"
          value={totalPaid}
          isCurrency
          icon={<CheckCircleOutlinedIcon sx={{ color: 'success.main', fontSize: 28 }} />}
          color="success"
          subtitle="Payments settled"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Outstanding"
          value={totalOutstanding}
          isCurrency
          icon={<HourglassEmptyOutlinedIcon sx={{ color: 'warning.main', fontSize: 28 }} />}
          color="warning"
          subtitle="Payables balance"
        />
      </Grid>
    </Grid>
  );
};

export default PurchaseSummaryCards;
