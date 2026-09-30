import React from 'react';
import { Box } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import StatCard from '../common/StatCard';

const LedgerSummaryCards = ({ summary, partyType = 'CUSTOMER' }) => {
  if (!summary) return null;

  const isCustomer = partyType !== 'SUPPLIER';

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
        title="Opening Balance"
        value={summary.openingBalance || 0}
        isCurrency
        icon={<AccountBalanceWalletOutlinedIcon />}
        color="info"
        subtitle={summary.openingBalanceType ? `Type: ${summary.openingBalanceType}` : 'Initial Balance'}
      />
      <StatCard
        title={isCustomer ? 'Total Debit (Sales)' : 'Total Debit (Payments)'}
        value={summary.totalDebit || 0}
        isCurrency
        icon={<ArrowUpwardOutlinedIcon />}
        color={isCustomer ? 'error' : 'success'}
        subtitle="Total Debit movements"
      />
      <StatCard
        title={isCustomer ? 'Total Credit (Receipts)' : 'Total Credit (Purchases)'}
        value={summary.totalCredit || 0}
        isCurrency
        icon={<ArrowDownwardOutlinedIcon />}
        color={isCustomer ? 'success' : 'error'}
        subtitle="Total Credit movements"
      />
      <StatCard
        title="Current Outstanding"
        value={summary.currentOutstanding || 0}
        isCurrency
        icon={<BalanceOutlinedIcon />}
        color={(summary.currentOutstanding || 0) > 0 ? 'warning' : 'info'}
        trend={summary.balanceType || summary.closingBalanceType}
        trendType={(summary.currentOutstanding || 0) > 0 ? 'down' : 'up'}
        subtitle={isCustomer ? 'Receivable from Customer' : 'Payable to Supplier'}
      />
    </Box>
  );
};

export default LedgerSummaryCards;
