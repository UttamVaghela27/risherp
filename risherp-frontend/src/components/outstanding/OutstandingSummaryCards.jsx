import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { formatCurrency } from '../../utils/formatters';

const OutstandingSummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Receivable',
      amount: summary.totalReceivable || 0,
      icon: TrendingUpOutlinedIcon,
      color: '#ed6c02',
      bgColor: '#fff3e0',
      subtitle: `${summary.customersWithOutstandingCount || 0} of ${summary.customerCount || 0} customers with balance`,
    },
    {
      title: 'Total Payable',
      amount: summary.totalPayable || 0,
      icon: TrendingDownOutlinedIcon,
      color: '#d32f2f',
      bgColor: '#ffebee',
      subtitle: `${summary.suppliersWithOutstandingCount || 0} of ${summary.supplierCount || 0} suppliers with balance`,
    },
    {
      title: 'Customer Accounts',
      amount: summary.customerCount || 0,
      isCount: true,
      icon: PeopleOutlinedIcon,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      subtitle: 'Active & tracked customers',
    },
    {
      title: 'Supplier Accounts',
      amount: summary.supplierCount || 0,
      isCount: true,
      icon: BusinessOutlinedIcon,
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
      subtitle: 'Active & tracked suppliers',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.06)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box sx={{ minWidth: 0, mr: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5} noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
                {card.title}
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: card.color, mt: 0.5, fontVariantNumeric: 'tabular-nums', fontSize: { md: '1.25rem', lg: '1.5rem' } }} noWrap>
                {card.isCount ? card.amount : formatCurrency(card.amount)}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5, fontSize: '0.72rem' }}>
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

export default OutstandingSummaryCards;
