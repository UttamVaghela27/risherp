import React from 'react';
import { Box } from '@mui/material';
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
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(2, 1fr)',
      lg: 'repeat(4, 1fr)',
    },
    gap: 2.5,
    mb: 3,
  };

  if (loading) {
    return (
      <Box sx={gridStyle}>
        {[...Array(4)].map((_, i) => (
          <StatCard key={i} title="Loading..." value={null} loading={true} />
        ))}
      </Box>
    );
  }

  const totalInvoices = summary?.totalInvoices != null ? summary.totalInvoices : 0;
  const totalPurchases = summary?.totalPurchases ?? summary?.totalPurchasesAmount ?? 0;
  const totalPaid = summary?.totalPaid ?? 0;
  const totalOutstanding = summary?.totalOutstanding ?? summary?.totalBalance ?? 0;

  return (
    <Box sx={gridStyle}>
      <StatCard
        title="Total Invoices"
        value={totalInvoices}
        icon={<ReceiptLongOutlinedIcon />}
        color="primary"
        subtitle="Bills recorded"
      />
      <StatCard
        title="Total Purchases"
        value={totalPurchases}
        isCurrency
        icon={<ShoppingCartOutlinedIcon />}
        color="info"
        subtitle="Procurement expenditure"
      />
      <StatCard
        title="Total Paid"
        value={totalPaid}
        isCurrency
        icon={<CheckCircleOutlinedIcon />}
        color="success"
        subtitle="Payments settled"
      />
      <StatCard
        title="Total Outstanding"
        value={totalOutstanding}
        isCurrency
        icon={<HourglassEmptyOutlinedIcon />}
        color="warning"
        subtitle="Payables balance"
      />
    </Box>
  );
};

export default PurchaseSummaryCards;
