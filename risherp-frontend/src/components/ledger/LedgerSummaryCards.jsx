import React from 'react';
import { Grid, Paper, Typography, Box, Chip, useTheme } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import { formatCurrency } from '../../utils/formatters';
import { alpha } from '@mui/material/styles';

const LedgerSummaryCards = ({ summary, partyType = 'CUSTOMER' }) => {
  const theme = useTheme();
  if (!summary) return null;

  const isCustomer = partyType !== 'SUPPLIER';

  const cards = [
    {
      title: 'Opening Balance',
      amount: summary.openingBalance || 0,
      icon: AccountBalanceWalletOutlinedIcon,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.12),
      subtitle: summary.openingBalanceType ? `Type: ${summary.openingBalanceType}` : 'Initial Balance',
    },
    {
      title: isCustomer ? 'Total Debit (Sales/Debits)' : 'Total Debit (Payments/Debits)',
      amount: summary.totalDebit || 0,
      icon: ArrowUpwardOutlinedIcon,
      color: isCustomer ? theme.palette.error.main : theme.palette.success.main,
      bgColor: isCustomer ? alpha(theme.palette.error.main, 0.12) : alpha(theme.palette.success.main, 0.12),
      subtitle: 'Total Debit movements',
    },
    {
      title: isCustomer ? 'Total Credit (Receipts/Credits)' : 'Total Credit (Purchases/Credits)',
      amount: summary.totalCredit || 0,
      icon: ArrowDownwardOutlinedIcon,
      color: isCustomer ? theme.palette.success.main : theme.palette.error.main,
      bgColor: isCustomer ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.error.main, 0.12),
      subtitle: 'Total Credit movements',
    },
    {
      title: 'Current Outstanding',
      amount: summary.currentOutstanding || 0,
      icon: BalanceOutlinedIcon,
      color: (summary.currentOutstanding || 0) > 0 ? theme.palette.warning.main : theme.palette.info.main,
      bgColor: (summary.currentOutstanding || 0) > 0 ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.info.main, 0.12),
      chip: summary.balanceType || summary.closingBalanceType,
      subtitle: isCustomer ? 'Receivable from Customer' : 'Payable to Supplier',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2.5,
        mb: 3,
      }}
    >
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: 1, borderColor: 'divider',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
                {card.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: card.color }}>
                  {formatCurrency(card.amount)}
                </Typography>
                {card.chip && (
                  <Chip
                    label={card.chip}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: card.bgColor,
                      color: card.color,
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {card.subtitle}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: card.bgColor,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconComponent sx={{ fontSize: 26 }} />
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default LedgerSummaryCards;
