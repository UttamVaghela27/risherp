import { Box, useTheme, alpha
} from '@mui/material';

/**
 * StatusChip Component
 * Modern pill badge with subtle dot indicator and harmonic pastel color styles
 * reflecting status across Parties, Sales, Invoices, Items, Orders, and Users.
 */
const StatusChip = ({ status = '', size = 'small', sx = {} }) => {
  const theme = useTheme();
  const norm = (status || '').toUpperCase().trim();

  const getStyle = (s) => {
    switch (s) {
      case 'PAID':
      case 'ACTIVE':
      case 'IN STOCK':
      case 'COMPLETED':
      case 'APPROVED':
      case 'VERIFIED':
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          border: alpha(theme.palette.success.main, 0.2),
          text: '#065f46',
          dot: theme.palette.success.main,
        };

      case 'PENDING':
      case 'PARTIAL':
      case 'LOW STOCK':
      case 'IN PROGRESS':
      case 'DRAFT':
        return {
          bg: alpha(theme.palette.warning.main, 0.05),
          border: alpha(theme.palette.warning.main, 0.2),
          text: theme.palette.warning.dark,
          dot: theme.palette.warning.main,
        };

      case 'UNPAID':
      case 'INACTIVE':
      case 'OUT OF STOCK':
      case 'CANCELLED':
      case 'OVERDUE':
      case 'REJECTED':
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          border: alpha(theme.palette.error.main, 0.2),
          text: '#991b1b',
          dot: theme.palette.error.main,
        };

      case 'PROCESSING':
      case 'ORDERED':
        return {
          bg: '#f0f9ff',
          border: '#bae6fd',
          text: '#0369a1',
          dot: '#0284c7',
        };

      default:
        return {
          bg: theme.palette.background.default,
          border: theme.palette.divider,
          text: theme.palette.text.secondary,
          dot: theme.palette.text.secondary,
        };
    }
  };

  const style = getStyle(norm);
  const isSmall = size === 'small';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.65,
        px: isSmall ? 1 : 1.25,
        py: isSmall ? 0.25 : 0.4,
        borderRadius: '9999px',
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        lineHeight: 1.2,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: style.dot,
        }}
      />
      <span>{status || 'N/A'}</span>
    </Box>
  );
};

export default StatusChip;
