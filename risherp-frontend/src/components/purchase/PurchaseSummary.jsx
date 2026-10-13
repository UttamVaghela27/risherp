import {
  Box, Paper, Typography, Divider, TextField,
  InputAdornment, Stack, ToggleButton, ToggleButtonGroup,
  useTheme
} from '@mui/material';
import { formatCurrency } from '../../utils/saleCalculations';

/**
 * PurchaseSummary — summary panel for purchase invoice.
 * Displays subtotal, item discounts, overall discount input, and grand total.
 */
const PurchaseSummary = ({
  subtotal,
  itemDiscount,
  overallDiscount,
  overallDiscountType,
  grandTotal,
  onOverallDiscountChange,
  onOverallDiscountTypeChange,
}) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary} sx={{ display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
        PURCHASE SUMMARY
      </Typography>

      <Stack spacing={1.5}>
        {/* Subtotal */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Subtotal</Typography>
          <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(subtotal)}</Typography>
        </Box>

        {/* Item Discount */}
        {itemDiscount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Item Discounts</Typography>
            <Typography variant="body2" fontWeight={700} color="success.main" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              -{formatCurrency(itemDiscount)}
            </Typography>
          </Box>
        )}

        {/* Overall Discount */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Overall Bill Discount
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={overallDiscountType || 'AMOUNT'}
              exclusive
              onChange={(e, val) => val && onOverallDiscountTypeChange(val)}
              size="small"
              sx={{
                height: 38,
                flexShrink: 0,
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                },
              }}
            >
              <ToggleButton value="AMOUNT">₹</ToggleButton>
              <ToggleButton value="PERCENTAGE">%</ToggleButton>
            </ToggleButtonGroup>
            <TextField
              size="small"
              type="text"
              value={overallDiscount || ''}
              onChange={(e) => onOverallDiscountChange(e.target.value)}
              placeholder="0"
              slotProps={{
                htmlInput: { inputMode: 'decimal', min: 0, step: 0.01, style: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } },
                input: {
                  startAdornment: overallDiscountType === 'AMOUNT'
                    ? <InputAdornment position="start">₹</InputAdornment>
                    : <InputAdornment position="start">%</InputAdornment>
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              fullWidth
            />
          </Box>
        </Box>

        {/* Grand Total Banner */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          p: 2, borderRadius: '12px',
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
          mt: 1,
        }}>
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#ccfbf1', letterSpacing: '0.05em', display: 'block' }}>
              NET PAYABLE
            </Typography>
            <Typography variant="subtitle2" fontWeight={800} color="white">
              GRAND TOTAL
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={900} color="white" sx={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {formatCurrency(grandTotal)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default PurchaseSummary;
