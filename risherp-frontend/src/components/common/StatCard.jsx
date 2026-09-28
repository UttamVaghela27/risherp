import { Card, CardContent, Typography, Box, Skeleton, useTheme,
  alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CurrencyDisplay from './CurrencyDisplay';

/**
 * StatCard Component
 * Executive metric summary card for ERP Dashboard and Reports.
 */
const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendType = 'up',
  subtitle = 'vs yesterday',
  isCurrency = false,
  color = 'primary',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isUp = trendType === 'up';
  const isDown = trendType === 'down';

  // Auto-detect loading state: value is null/undefined/'—' means data not yet fetched
  const isValueLoading = value === null || value === undefined || value === '—';

  const colorStyles = {
    primary: {
      bg: isDark ? 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(29,78,216,0.2) 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      iconColor: isDark ? '#60a5fa' : theme.palette.info.main,
      glow: isDark ? 'rgba(96,165,250,0.15)' : 'rgba(37, 99, 235, 0.15)',
    },
    success: {
      bg: isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(4,120,87,0.2) 100%)' : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      iconColor: isDark ? '#34d399' : theme.palette.success.main,
      glow: isDark ? 'rgba(52,211,153,0.15)' : 'rgba(16, 185, 129, 0.15)',
    },
    warning: {
      bg: isDark ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(180,83,9,0.2) 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      iconColor: isDark ? '#fbbf24' : theme.palette.warning.main,
      glow: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(245, 158, 11, 0.15)',
    },
    error: {
      bg: isDark ? 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(185,28,28,0.2) 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      iconColor: isDark ? '#f87171' : theme.palette.error.main,
      glow: isDark ? 'rgba(248,113,113,0.15)' : 'rgba(239, 68, 68, 0.15)',
    },
    info: {
      bg: isDark ? 'linear-gradient(135deg, rgba(2,132,199,0.2) 0%, rgba(3,105,161,0.2) 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      iconColor: isDark ? '#38bdf8' : '#0284c7',
      glow: isDark ? 'rgba(56,189,248,0.15)' : 'rgba(2, 132, 199, 0.15)',
    },
    secondary: {
      bg: isDark ? 'linear-gradient(135deg, rgba(15,118,110,0.2) 0%, rgba(17,94,89,0.2) 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #ccfbf1 100%)',
      iconColor: isDark ? '#2dd4bf' : '#0f766e',
      glow: isDark ? 'rgba(45,212,191,0.15)' : 'rgba(15, 118, 110, 0.15)',
    },
  };

  const style = colorStyles[color] || colorStyles.primary;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 8px 20px -4px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)' : '0 8px 20px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
          borderColor: isDark ? theme.palette.text.secondary : theme.palette.divider,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          {/* Left — Icon badge */}
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: style.bg,
                color: style.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${style.glow}`,
                flexShrink: 0,
              }}
            >
              {typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof && !icon.props) ? (
                (() => {
                  const IconComp = icon;
                  return <IconComp sx={{ fontSize: 24 }} />;
                })()
              ) : (
                icon
              )}
            </Box>
          )}

          {/* Right — Title, Value, Trend / Subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                fontSize: '0.72rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              {title}
            </Typography>

            <Box sx={{ mb: 0.75 }}>
              {isValueLoading ? (
                <Skeleton
                  variant="text"
                  width="70%"
                  height={34}
                  sx={{ borderRadius: 1, transform: 'none' }}
                />
              ) : isCurrency ? (
                <CurrencyDisplay
                  amount={value}
                  variant="h5"
                  fontWeight={800}
                  color={theme.palette.text.primary}
                  sx={{ letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}
                />
              ) : (
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    letterSpacing: -0.5,
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: { xs: '1.25rem', sm: '1.4rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {value}
                </Typography>
              )}
            </Box>

            {isValueLoading ? (
              <Skeleton
                variant="text"
                width="50%"
                height={16}
                sx={{ borderRadius: 1, transform: 'none' }}
              />
            ) : (trend || subtitle) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                {trend && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.3,
                      px: 0.85,
                      py: 0.25,
                      borderRadius: '9999px',
                      bgcolor: isUp ? (isDark ? 'rgba(16,185,129,0.1)' : alpha(theme.palette.success.main, 0.1)) : isDown ? (isDark ? 'rgba(239,68,68,0.1)' : alpha(theme.palette.error.main, 0.1)) : (isDark ? 'rgba(148,163,184,0.1)' : theme.palette.background.default),
                      color: isUp ? (isDark ? '#34d399' : '#065f46') : isDown ? (isDark ? '#f87171' : '#991b1b') : (isDark ? theme.palette.divider : theme.palette.text.secondary),
                      fontSize: '0.72rem',
                      fontWeight: 750,
                      border: `1px solid ${isUp ? (isDark ? 'rgba(52,211,153,0.3)' : alpha(theme.palette.success.main, 0.2)) : isDown ? (isDark ? 'rgba(248,113,113,0.3)' : alpha(theme.palette.error.main, 0.2)) : (isDark ? 'rgba(148,163,184,0.2)' : theme.palette.divider)}`,
                    }}
                  >
                    {isUp && <TrendingUpIcon sx={{ fontSize: 13, color: isDark ? '#34d399' : theme.palette.success.main }} />}
                    {isDown && <TrendingDownIcon sx={{ fontSize: 13, color: isDark ? '#f87171' : theme.palette.error.main }} />}
                    <span>{trend}</span>
                  </Box>
                )}
                {subtitle && (
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.73rem', fontWeight: 500 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
