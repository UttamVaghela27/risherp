import React from 'react';
import { Box } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import StatCard from '../common/StatCard';

const OutstandingSummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2.5,
        mb: 3,
      }}
    >
      <StatCard
        title="Total Receivable"
        value={summary.totalReceivable || 0}
        isCurrency
        icon={<TrendingUpOutlinedIcon />}
        color="warning"
        subtitle={`${summary.customersWithOutstandingCount || 0} of ${summary.customerCount || 0} customers with balance`}
      />
      <StatCard
        title="Total Payable"
        value={summary.totalPayable || 0}
        isCurrency
        icon={<TrendingDownOutlinedIcon />}
        color="error"
        subtitle={`${summary.suppliersWithOutstandingCount || 0} of ${summary.supplierCount || 0} suppliers with balance`}
      />
      <StatCard
        title="Customer Accounts"
        value={summary.customerCount || 0}
        icon={<PeopleOutlinedIcon />}
        color="primary"
        subtitle="Active & tracked customers"
      />
      <StatCard
        title="Supplier Accounts"
        value={summary.supplierCount || 0}
        icon={<BusinessOutlinedIcon />}
        color="secondary"
        subtitle="Active & tracked suppliers"
      />
    </Box>
  );
};

export default OutstandingSummaryCards;
