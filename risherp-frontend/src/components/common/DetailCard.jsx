import React, { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  useTheme, alpha
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import toast from 'react-hot-toast';

const getColors = (theme, alpha) => ({
  primary: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    icon: theme.palette.info.main,
    border: alpha(theme.palette.info.main, 0.2),
    glow: 'rgba(37, 99, 235, 0.12)',
  },
  secondary: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #ccfbf1 100%)',
    icon: '#0f766e',
    border: '#99f6e4',
    glow: 'rgba(15, 118, 110, 0.12)',
  },
  success: {
    bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    icon: theme.palette.success.main,
    border: alpha(theme.palette.success.main, 0.2),
    glow: 'rgba(16, 185, 129, 0.12)',
  },
  warning: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    icon: theme.palette.warning.main,
    border: alpha(theme.palette.warning.main, 0.2),
    glow: 'rgba(245, 158, 11, 0.12)',
  },
  error: {
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    icon: theme.palette.error.main,
    border: alpha(theme.palette.error.main, 0.2),
    glow: 'rgba(239, 68, 68, 0.12)',
  },
  info: {
    bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    icon: '#0284c7',
    border: '#bae6fd',
    glow: 'rgba(2, 132, 199, 0.12)',
  },
  indigo: {
    bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    icon: '#4f46e5',
    border: '#c7d2fe',
    glow: 'rgba(79, 70, 229, 0.12)',
  },
  violet: {
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    icon: theme.palette.secondary.main,
    border: alpha(theme.palette.secondary.main, 0.2),
    glow: 'rgba(124, 58, 237, 0.12)',
  },
});

/**
 * DetailKPICard
 * Executive metric card for detail view top summary rows.
 */
export const DetailKPICard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  badge,
  onClick,
}) => {
  const theme = useTheme();
  const colors = getColors(theme, alpha);
  const palette = colors[color] || colors.primary;

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.2,
        height: '100%',
        borderRadius: 3,
        border: 1, borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 18px -4px rgba(0, 0, 0, 0.07)',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ flex: 1, pr: 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.7,
              fontSize: '0.7rem',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            {typeof value === 'string' || typeof value === 'number' ? (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '1.15rem', sm: '1.25rem' },
                }}
              >
                {value}
              </Typography>
            ) : (
              value
            )}
          </Box>
        </Box>

        {icon && (
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.2,
              background: palette.bg,
              color: palette.icon,
              border: `1px solid ${palette.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 6px ${palette.glow}`,
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 20 } })}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 0.5 }}>
        {subtitle ? (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        ) : <Box />}

        {badge && <Box sx={{ ml: 'auto' }}>{badge}</Box>}
      </Box>
    </Card>
  );
};

/**
 * DetailRow
 * Structured key-value row with guaranteed spacing and clear label/value separation.
 */
export const DetailRow = ({
  label,
  value,
  icon,
  copyable = false,
  copyValue,
  valueColor,
  divider = true,
  isBold = false,
  customValue,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    const textToCopy = copyValue || (typeof value === 'string' ? value : '');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(`Copied: ${textToCopy}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayVal = value !== null && value !== undefined && value !== '' ? value : '—';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        py: 1.1,
        px: 1,
        mx: -1,
        borderRadius: 1.5,
        borderBottom: divider ? `1px solid ${theme.palette.divider}` : 'none',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: 'background.default',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: { xs: 130, sm: 160 },
          flexShrink: 0,
          pr: 1.5,
        }}
      >
        {icon && (
          <Box sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(icon, { sx: { fontSize: 16 } })}
          </Box>
        )}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.815rem',
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.75,
          textAlign: 'right',
        }}
      >
        {customValue ? (
          customValue
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: valueColor || theme.palette.text.primary,
              fontSize: '0.835rem',
              fontWeight: isBold ? 700 : 600,
              wordBreak: 'break-word',
              maxWidth: '100%',
            }}
          >
            {displayVal}
          </Typography>
        )}

        {copyable && displayVal !== '—' && (
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                p: 0.3,
                color: copied ? 'success.main' : theme.palette.text.secondary,
                '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.info.main, 0.1) },
              }}
            >
              {copied ? <CheckOutlinedIcon sx={{ fontSize: 14 }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

/**
 * DetailCard
 * Executive Card wrapper with styled header, colored icon container, and action slot.
 */
export const DetailCard = ({
  title,
  subtitle,
  icon,
  color = 'primary',
  headerAction,
  children,
  footer,
  sx = {},
}) => {
  const theme = useTheme();
  const colors = getColors(theme, alpha);
  const palette = colors[color] || colors.primary;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: 1, borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1, borderColor: 'divider',
          bgcolor: '#fafbfc',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon && (
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                background: palette.bg,
                color: palette.icon,
                border: `1px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: 18 } })}
            </Box>
          )}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 750,
                color: theme.palette.text.primary,
                fontSize: '0.925rem',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontSize: '0.725rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {headerAction && <Box>{headerAction}</Box>}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>

      {/* Optional Footer */}
      {footer && (
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            bgcolor: 'background.default',
            borderTop: 1, borderColor: 'divider',
            mt: 'auto',
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  );
};

export default DetailCard;
