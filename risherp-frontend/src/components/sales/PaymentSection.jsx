import {
  Box, Paper, Typography, TextField, InputAdornment, ButtonBase,
  FormControl, InputLabel, Select, MenuItem,
  Alert, Stack, Divider, useTheme, alpha
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { formatCurrency } from '../../utils/saleCalculations';

/**
 * PaymentSection — sale type, payment mode, paid amount, and balance display.
 */
const PaymentSection = ({
  saleType,
  paymentMode,
  paidAmount,
  grandTotal,
  balanceAmount,
  paymentStatus,
  onSaleTypeChange,
  onPaymentModeChange,
  onPaidAmountChange,
  errors = {},
}) => {
  const theme = useTheme();
  const getStatusColor = () => {
    if (paymentStatus === 'PAID') return 'success';
    if (paymentStatus === 'PARTIAL') return 'warning';
    return 'info';
  };

  const getStatusMessage = () => {
    if (paymentStatus === 'PAID') return 'Fully Paid — No outstanding balance.';
    if (paymentStatus === 'PARTIAL') return `Partial payment. Balance ₹${parseFloat(balanceAmount).toFixed(2)} will be on credit.`;
    return `Credit sale. Full amount ₹${parseFloat(grandTotal).toFixed(2)} is outstanding.`;
  };

  return (
    <Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
        PAYMENT & SETTLEMENT
      </Typography>

      <Stack spacing={2}>
        {/* Sale Type */}
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
            {[
              { id: 'CASH', label: 'Cash', icon: '💵', color: 'success' },
              { id: 'CREDIT', label: 'Credit', icon: '📋', color: 'primary' },
              { id: 'PARTIAL', label: 'Partial', icon: '↗', color: 'warning' },
            ].map((opt) => {
              const isSelected = saleType === opt.id;
              const mainColor = theme.palette[opt.color].main;
              
              return (
                <ButtonBase
                  key={opt.id}
                  onClick={() => onSaleTypeChange(opt.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    py: 1,
                    px: 1,
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: isSelected ? mainColor : 'divider',
                    bgcolor: isSelected ? alpha(mainColor, 0.1) : 'background.paper',
                    color: isSelected ? mainColor : 'text.secondary',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.825rem',
                    boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: isSelected ? alpha(mainColor, 0.15) : 'action.hover',
                      borderColor: isSelected ? mainColor : 'text.primary',
                    },
                  }}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        {/* Payment Mode — show only if payment expected */}
        {(saleType === 'CASH' || saleType === 'PARTIAL') && (
          <FormControl size="small" fullWidth>
            <InputLabel>Payment Mode</InputLabel>
            <Select
              value={paymentMode || ''}
              label="Payment Mode"
              onChange={(e) => onPaymentModeChange(e.target.value)}
              error={!!errors.paymentMode}
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="CASH">💵 Cash</MenuItem>
              <MenuItem value="UPI">📱 UPI / QR</MenuItem>
              <MenuItem value="BANK_TRANSFER">🏦 Bank Transfer</MenuItem>
              <MenuItem value="CHEQUE">📄 Cheque</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
            {errors.paymentMode && (
              <Typography variant="caption" color="error">{errors.paymentMode}</Typography>
            )}
          </FormControl>
        )}

        {/* Paid Amount Input */}
        <TextField
          fullWidth
          size="small"
          label="Paid Amount"
          type="number"
          value={paidAmount}
          onChange={(e) => onPaidAmountChange(e.target.value)}
          slotProps={{
            htmlInput: { min: 0, step: 0.01, style: { fontVariantNumeric: 'tabular-nums' } },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }
          }}
          error={!!errors.paidAmount}
          helperText={errors.paidAmount}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />

        {/* Balance Display Card */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          p: 1.5, borderRadius: '10px',
          bgcolor: parseFloat(balanceAmount) > 0 ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.success.main, 0.1),
          border: '1px solid',
          borderColor: parseFloat(balanceAmount) > 0 ? alpha(theme.palette.warning.main, 0.3) : alpha(theme.palette.success.main, 0.3),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWalletOutlinedIcon fontSize="small" sx={{ color: parseFloat(balanceAmount) > 0 ? 'warning.main' : 'success.main' }} />
            <Typography variant="body2" fontWeight={700} color={parseFloat(balanceAmount) > 0 ? 'warning.main' : 'success.main'}>
              {parseFloat(balanceAmount) > 0 ? 'Outstanding Balance' : 'Fully Settled'}
            </Typography>
          </Box>
          <Typography variant="subtitle2" fontWeight={800}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
            color={parseFloat(balanceAmount) > 0 ? 'warning.main' : 'success.main'}>
            {formatCurrency(balanceAmount)}
          </Typography>
        </Box>

        {/* Payment Status Alert */}
        <Alert
          severity={getStatusColor()}
          sx={{
            py: 0.5,
            fontSize: '0.75rem',
            borderRadius: '8px',
            '& .MuiAlert-message': { py: 0 }
          }}
        >
          {getStatusMessage()}
        </Alert>
      </Stack>
    </Box>
  );
};

export default PaymentSection;
