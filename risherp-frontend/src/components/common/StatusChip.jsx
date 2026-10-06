import { Box, useTheme, alpha } from '@mui/material';

const StatusChip = ({ status = '', size = 'small', sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
          bg: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
          border: alpha(theme.palette.success.main, 0.35),
          text: isDark ? theme.palette.success.light : theme.palette.success.dark,
          dot: theme.palette.success.main,
        };
      case 'PENDING':
      case 'PARTIAL':
      case 'LOW STOCK':
      case 'IN PROGRESS':
      case 'DRAFT':
        return {
          bg: alpha(theme.palette.warning.main, isDark ? 0.18 : 0.1),
          border: alpha(theme.palette.warning.main, 0.35),
          text: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
          dot: theme.palette.warning.main,
        };
      case 'UNPAID':
      case 'INACTIVE':
      case 'OUT OF STOCK':
      case 'CANCELLED':
      case 'OVERDUE':
      case 'REJECTED':
        return {
          bg: alpha(theme.palette.error.main, isDark ? 0.2 : 0.1),
          border: alpha(theme.palette.error.main, 0.35),
          text: isDark ? theme.palette.error.light : theme.palette.error.dark,
          dot: theme.palette.error.main,
        };
      case 'PROCESSING':
      case 'ORDERED':
        return {
          bg: alpha(theme.palette.info.main, isDark ? 0.2 : 0.1),
          border: alpha(theme.palette.info.main, 0.35),
          text: isDark ? theme.palette.info.light : theme.palette.info.dark,
          dot: theme.palette.info.main,
        };
      default:
        return {
          bg: alpha(theme.palette.text.secondary, isDark ? 0.12 : 0.08),
          border: theme.palette.divider,
          text: 'text.secondary',
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
        gap: 0.6,
        px: isSmall ? 1 : 1.25,
        py: isSmall ? 0.3 : 0.45,
        borderRadius: '9999px',
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize: isSmall ? '0.68rem' : '0.72rem',
        fontWeight: 650,
        textTransform: 'uppercase',
        letterSpacing: 0.35,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: style.dot, flexShrink: 0 }} />
      <span>{status || 'N/A'}</span>
    </Box>
  );
};

export default StatusChip;
