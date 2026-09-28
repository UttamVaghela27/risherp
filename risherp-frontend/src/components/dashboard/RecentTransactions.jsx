import { Box, Typography, useTheme,
  alpha
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import DataTable from '../common/DataTable';
import StatusChip from '../common/StatusChip';
import CurrencyDisplay from '../common/CurrencyDisplay';
import DateDisplay from '../common/DateDisplay';

/**
 * RecentTransactions Component
 * High-density table displaying the latest sales invoices, purchase bills, receipts, and payments.
 */
const RecentTransactions = ({ transactions = [], loading = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getTypeStyle = (type) => {
    const t = (type || '').toUpperCase();
    switch (t) {
      case 'SALE':
        return { color: '#0f766e', bgcolor: '#f0fdf4' };
      case 'PURCHASE':
        return { color: theme.palette.info.dark, bgcolor: alpha(theme.palette.info.main, 0.1) };
      case 'RECEIPT':
        return { color: '#15803d', bgcolor: '#f0fdf4' };
      case 'PAYMENT':
        return { color: theme.palette.warning.dark, bgcolor: alpha(theme.palette.warning.main, 0.1) };
      default:
        return { color: theme.palette.text.secondary, bgcolor: 'background.default' };
    }
  };

  const columns = [
    {
      id: 'reference',
      label: 'Ref No / Voucher',
      minWidth: 140,
      render: (val, row) => (
        <Typography
          variant="body2"
          fontWeight={700}
          color="primary.main"
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => {
            if (row.type === 'SALE') navigate('/sales');
            else if (row.type === 'PURCHASE') navigate('/purchases');
            else if (row.type === 'RECEIPT') navigate('/receipts');
            else if (row.type === 'PAYMENT') navigate('/payments');
          }}
        >
          {val || row.id || '-'}
        </Typography>
      ),
    },
    {
      id: 'date',
      label: 'Date & Time',
      minWidth: 150,
      render: (val) => <DateDisplay date={val} format="datetime" />,
    },
    {
      id: 'partyName',
      label: 'Party Name',
      minWidth: 190,
      render: (val) => (
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {val || 'Walk-in Customer'}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 100,
      render: (val) => {
        const style = getTypeStyle(val);
        return (
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              color: style.color,
              bgcolor: style.bgcolor,
              px: 1,
              py: 0.35,
              borderRadius: 1,
              display: 'inline-block',
              textTransform: 'uppercase',
              letterSpacing: 0.3,
            }}
          >
            {val || 'SALE'}
          </Typography>
        );
      },
    },
    {
      id: 'paymentMode',
      label: 'Payment Mode',
      minWidth: 110,
      render: (val) => (
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {val || 'CASH'}
        </Typography>
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right',
      minWidth: 130,
      render: (val) => <CurrencyDisplay amount={val} variant="body2" fontWeight={750} />,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      minWidth: 110,
      render: (val) => <StatusChip status={val || 'PAID'} />,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <DataTable
        title="Recent Invoices & Transactions"
        columns={columns}
        rows={transactions}
        loading={loading}
        searchPlaceholder="Search by reference, party, type or mode..."
        emptyMessage="No recent transactions found"
        actions={
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/sales')}
            endIcon={<ArrowForwardIcon fontSize="small" />}
            sx={{ textTransform: 'none', px: 2, fontWeight: 600 }}
          >
            All Sales
          </Button>
        }
      />
    </Box>
  );
};

export default RecentTransactions;
