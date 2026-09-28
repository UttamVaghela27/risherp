import { Typography } from '@mui/material';

/**
 * CurrencyDisplay Component
 * Standardized INR (₹) formatting for financial records.
 */
const CurrencyDisplay = ({
  amount = 0,
  showSymbol = true,
  variant = 'body1',
  fontWeight = 700,
  color,
  decimals = 2,
  sx = {},
}) => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericAmount);

  return (
    <Typography
      component="span"
      variant={variant}
      sx={{
        fontWeight,
        color: color || 'inherit',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: -0.2,
        ...sx,
      }}
    >
      {showSymbol && '₹'} {formatted}
    </Typography>
  );
};

export default CurrencyDisplay;
