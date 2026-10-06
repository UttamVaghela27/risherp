import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { useNavigate } from 'react-router-dom';
import CurrencyDisplay from '../common/CurrencyDisplay';

/**
 * CustomerOutstanding Component
 * Lists top accounts receivable to assist in collection and cash flow monitoring.
 */
const CustomerOutstanding = ({ customers = [], loading = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card sx={{ height: '100%', p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={160} height={28} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width={180} height={16} sx={{ mb: 2 }} />
        <Divider sx={{ mb: 2 }} />
        {Array.from({ length: 4 }).map((_, idx) => (
          <Box key={idx} sx={{ py: 1.25, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Skeleton variant="text" width={130} height={20} />
              <Skeleton variant="text" width={80} height={16} />
            </Box>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWalletOutlinedIcon sx={{ color: 'error.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Receivables
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => navigate('/parties')}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.5, fontWeight: 600 }}
          >
            All Parties
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Top customer balances awaiting payment
        </Typography>

        <Divider sx={{ mb: 1 }} />

        {/* List */}
        {customers.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              gap: 1,
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 36, color: 'success.main', opacity: 0.8 }} />
            <Typography variant="subtitle2" fontWeight={650} color="text.primary">
              No Pending Receivables
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              All customer accounts are clear.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ flex: 1 }}>
            {customers.map((c, idx) => (
              <ListItem
                key={c.partyId || idx}
                disableGutters
                sx={{
                  py: 1.25,
                  borderBottom: idx < customers.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ minWidth: 0, pr: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={650} color="text.primary" noWrap>
                    {c.partyName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                    <Chip
                      size="small"
                      label={c.overdueDays > 0 ? `${c.overdueDays}d overdue` : 'Current'}
                      color={c.overdueDays > 30 ? 'error' : c.overdueDays > 0 ? 'warning' : 'default'}
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                <CurrencyDisplay
                  amount={c.amount}
                  variant="subtitle2"
                  fontWeight={750}
                  color="error.main"
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerOutstanding;
