import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Avatar,
  Stack,
  useTheme,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PageHeader from '../../components/common/PageHeader';

const ReportsHub = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const reportModules = [
    {
      id: 'sales-report',
      title: 'Sales Report',
      description: 'Analyze invoice revenue, item-wise sales, customer performance, and daily sales trends.',
      path: '/reports/sales',
      icon: <AssessmentOutlinedIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.info.main,
      tag: 'REVENUE',
    },
    {
      id: 'purchase-report',
      title: 'Purchase Report',
      description: 'Review procurement expenditures, item-wise purchases, and supplier breakdowns.',
      path: '/reports/purchases',
      icon: <InsightsOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
      tag: 'EXPENSE',
    },
    {
      id: 'stock-report',
      title: 'Stock Report',
      description: 'Track inventory on-hand valuation, stock movement ledger, and low-stock shortages.',
      path: '/reports/stock',
      icon: <InventoryOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#06b6d4',
      tag: 'INVENTORY',
    },
    {
      id: 'profit-report',
      title: 'Profit & Loss Report',
      description: 'Gross profit and gross margin analysis computed directly from historical cost and net sales.',
      path: '/reports/profit',
      icon: <TrendingUpOutlinedIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
      tag: 'MARGINS',
    },
    {
      id: 'outstanding-report',
      title: 'Outstanding Report',
      description: 'Customer receivables and supplier payables summaries reconciling ledger balances.',
      path: '/reports/outstanding',
      icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.warning.main,
      tag: 'ACCOUNTS',
    },
    {
      id: 'receipt-report',
      title: 'Receipt Report',
      description: 'Customer collection breakdown by payment modes (Cash, Bank Transfer, UPI, Cheque, Card).',
      path: '/reports/receipts',
      icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#14b8a6',
      tag: 'COLLECTIONS',
    },
    {
      id: 'payment-report',
      title: 'Payment Report',
      description: 'Supplier disbursement breakdown by payment modes and invoice allocations.',
      path: '/reports/payments',
      icon: <PaymentsOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#6366f1',
      tag: 'PAYMENTS',
    },
    {
      id: 'sales-return-report',
      title: 'Sales Return Report',
      description: 'Audit returned goods, refund amounts, adjustment allocations, and return reasons.',
      path: '/reports/sales-returns',
      icon: <AssignmentReturnOutlinedIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.error.main,
      tag: 'RETURNS',
    },
    {
      id: 'purchase-return-report',
      title: 'Purchase Return Report',
      description: 'Monitor goods returned to suppliers, refund collections, and debit adjustments.',
      path: '/reports/purchase-returns',
      icon: <UndoOutlinedIcon sx={{ fontSize: 28 }} />,
      color: '#ec4899',
      tag: 'RETURNS',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Standard Header */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Enterprise financial reports, stock valuation, and operational analytics derived from live transactions."
      />

      {/* Grid of Report Cards */}
      <Grid container spacing={3}>
        {reportModules.map((m) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={m.id}>
            <Card
              sx={{
                height: '100%',
                border: 1,
                borderColor: 'divider',
                borderRadius: '16px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px -4px rgba(0, 0, 0, 0.08)',
                  borderColor: m.color,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(m.path)}
                sx={{
                  height: '100%',
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${m.color}15`,
                        color: m.color,
                        width: 50,
                        height: 50,
                        borderRadius: '12px',
                      }}
                    >
                      {m.icon}
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '20px',
                        bgcolor: `${m.color}12`,
                        color: m.color,
                        fontSize: '0.68rem',
                      }}
                    >
                      {m.tag}
                    </Typography>
                  </Stack>

                  <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1, lineHeight: 1.2 }}>
                    {m.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                    {m.description}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    mt: 3,
                    pt: 1.5,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="button" sx={{ color: m.color, fontWeight: 700, fontSize: '0.8rem', textTransform: 'none' }}>
                    View Report
                  </Typography>
                  <ArrowForwardIosIcon sx={{ fontSize: 13, color: m.color }} />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsHub;
