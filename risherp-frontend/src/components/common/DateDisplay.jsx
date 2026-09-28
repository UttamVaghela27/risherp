import { Typography } from '@mui/material';

/**
 * DateDisplay Component
 * Standardized date formatting for business reports and logs.
 */
const DateDisplay = ({
  date,
  format = 'date',
  variant = 'body2',
  color = 'text.secondary',
  sx = {},
}) => {
  if (!date) return <Typography component="span" variant={variant} color="text.disabled">-</Typography>;

  const d = new Date(date);
  if (isNaN(d.getTime())) return <Typography component="span" variant={variant} color="text.disabled">{date}</Typography>;

  let formatted = '';
  const optionsDate = { day: '2-digit', month: 'short', year: 'numeric' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };

  if (format === 'date') {
    formatted = d.toLocaleDateString('en-IN', optionsDate);
  } else if (format === 'time') {
    formatted = d.toLocaleTimeString('en-IN', optionsTime);
  } else if (format === 'datetime') {
    formatted = `${d.toLocaleDateString('en-IN', optionsDate)} ${d.toLocaleTimeString('en-IN', optionsTime)}`;
  }

  return (
    <Typography
      component="span"
      variant={variant}
      sx={{ color, fontVariantNumeric: 'tabular-nums', ...sx }}
    >
      {formatted}
    </Typography>
  );
};

export default DateDisplay;
