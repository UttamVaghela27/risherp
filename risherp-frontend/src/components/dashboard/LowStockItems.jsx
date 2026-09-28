import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  Skeleton,
  useTheme
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../common/StatusChip';

/**
 * LowStockItems Component
 * Alerts inventory managers of items falling below safe minimum stock levels.
 */
const LowStockItems = ({ items = [], loading = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card sx={{ height: '100%', p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={140} height={28} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width={180} height={16} sx={{ mb: 2 }} />
        <Divider sx={{ mb: 2 }} />
        {Array.from({ length: 4 }).map((_, idx) => (
          <Box key={idx} sx={{ py: 1.25, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="text" width={100} height={16} />
            </Box>
            <Skeleton variant="rectangular" width={75} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with View All Action */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Low Stock Alert
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/stock')}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.5, fontWeight: 600 }}
          >
            View Stock
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Items below safety reorder threshold
        </Typography>

        <Divider sx={{ mb: 1 }} />

        {/* Item List or Healthy State */}
        {items.length === 0 ? (
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
            <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
            <Typography variant="subtitle2" fontWeight={650} color="text.primary">
              All Stock Healthy
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              No items currently require immediate reorder.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ flex: 1 }}>
            {items.map((item, idx) => {
              const isOutOfStock = item.currentStock <= 0 || item.status === 'OUT_OF_STOCK';
              return (
                <ListItem
                  key={item.itemId || idx}
                  disableGutters
                  sx={{
                    py: 1.25,
                    borderBottom: idx < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ minWidth: 0, pr: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={650} color="text.primary" noWrap>
                      {item.itemName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25, flexWrap: 'wrap' }}>
                      {item.itemCode && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          [{item.itemCode}]
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        In Stock:{' '}
                        <strong style={{ color: isOutOfStock ? theme.palette.error.main : '#ea580c' }}>
                          {item.currentStock} {item.unit || 'Units'}
                        </strong>{' '}
                        (Min: {item.minimumStock})
                      </Typography>
                    </Box>
                  </Box>

                  <StatusChip
                    status={isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                    size="small"
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockItems;
