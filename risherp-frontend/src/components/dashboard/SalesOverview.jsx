import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

/**
 * SalesOverview Component
 * Visual bar comparison of Sales vs Purchases across the selected period.
 */
const SalesOverview = ({
  salesData = [],
  purchaseData = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <Card sx={{ height: '100%', p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="rectangular" width={140} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
      </Card>
    );
  }

  // Combine sales and purchase data by matching date/label
  const dataPoints = (salesData.length > 0 ? salesData : []).map((saleItem, idx) => {
    const purchaseItem = purchaseData[idx] || {};
    return {
      date: saleItem.date || purchaseItem.date || `Day ${idx + 1}`,
      label: saleItem.label || purchaseItem.label || '',
      salesAmount: Number(saleItem.amount) || 0,
      salesCount: saleItem.count || 0,
      purchaseAmount: Number(purchaseItem.amount) || 0,
      purchaseCount: purchaseItem.count || 0,
    };
  });

  // Calculate totals
  const totalSales = dataPoints.reduce((acc, curr) => acc + curr.salesAmount, 0);
  const totalPurchases = dataPoints.reduce((acc, curr) => acc + curr.purchaseAmount, 0);
  const netMargin = totalSales - totalPurchases;

  // Find max amount to calculate bar height scale
  const maxVal = Math.max(
    ...dataPoints.flatMap((d) => [d.salesAmount, d.purchaseAmount]),
    1000 // avoid division by zero
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header & Legend */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Sales & Purchase Overview
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Comparative volume by timeline
            </Typography>
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Typography variant="caption" fontWeight={650} color="text.secondary">
                Sales
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'secondary.main' }} />
              <Typography variant="caption" fontWeight={650} color="text.secondary">
                Purchase
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Chart Bars Container */}
        {dataPoints.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 180,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No sales or purchase data available for this range
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: { xs: 0.5, sm: 1.5 },
              minHeight: 180,
              px: { xs: 0.5, sm: 2 },
              pb: 1,
            }}
          >
            {dataPoints.map((item, index) => {
              const salesHeight = Math.max((item.salesAmount / maxVal) * 140, 4);
              const purchaseHeight = Math.max((item.purchaseAmount / maxVal) * 140, 4);

              return (
                <Box
                  key={item.date || index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      gap: 0.75,
                      height: 140,
                      width: '100%',
                    }}
                  >
                    {/* Sales Bar with Tooltip */}
                    <Tooltip
                      arrow
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" fontWeight={700} display="block">
                            Sales: {formatCurrency(item.salesAmount)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {item.salesCount} Invoices
                          </Typography>
                          <Typography variant="caption" color="grey.400" display="block">
                            Date: {item.date}
                          </Typography>
                        </Box>
                      }
                    >
                      <Box
                        sx={{
                          width: { xs: 8, sm: 16 },
                          height: `${salesHeight}px`,
                          bgcolor: 'primary.main',
                          borderRadius: '4px 4px 0 0',
                          cursor: 'pointer',
                          transition: 'height 0.3s ease, filter 0.15s ease',
                          '&:hover': {
                            filter: 'brightness(1.15)',
                            transform: 'scaleY(1.02)',
                          },
                        }}
                      />
                    </Tooltip>

                    {/* Purchase Bar with Tooltip */}
                    <Tooltip
                      arrow
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" fontWeight={700} display="block">
                            Purchase: {formatCurrency(item.purchaseAmount)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {item.purchaseCount} Bills
                          </Typography>
                          <Typography variant="caption" color="grey.400" display="block">
                            Date: {item.date}
                          </Typography>
                        </Box>
                      }
                    >
                      <Box
                        sx={{
                          width: { xs: 8, sm: 16 },
                          height: `${purchaseHeight}px`,
                          bgcolor: 'secondary.main',
                          borderRadius: '4px 4px 0 0',
                          cursor: 'pointer',
                          transition: 'height 0.3s ease, filter 0.15s ease',
                          '&:hover': {
                            filter: 'brightness(1.15)',
                            transform: 'scaleY(1.02)',
                          },
                        }}
                      />
                    </Tooltip>
                  </Box>

                  {/* Day / Date Label */}
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    {item.label || item.date}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Footer Summary Stats */}
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: 1, borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Period Sales
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              {formatCurrency(totalSales)}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Period Purchase
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} color="secondary.main">
              {formatCurrency(totalPurchases)}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Net Difference
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={netMargin >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(netMargin)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesOverview;
