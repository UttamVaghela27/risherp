import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, useTheme, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CurrencyDisplay from './CurrencyDisplay';

/**
 * StatCard Component
 * Modern executive metric summary card for ERP Dashboard, Reports, and Master Pages.
 * Standardized with consistent width, height, aligned rows, and responsive typography.
 */
const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendType = 'up',
  subtitle,
  isCurrency = false,
  color = 'primary',
  loading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isUp = trendType === 'up';
  const isDown = trendType === 'down';

  // Auto-detect loading state
  const isValueLoading = loading || value === null || value === undefined || value === '—';

  const colorStyles = {
    primary: {
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
      iconColor: isDark ? '#60a5fa' : '#2563eb',
      glow: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.15)',
      accent: '#3b82f6',
    },
    success: {
      bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
      iconColor: isDark ? '#34d399' : '#059669',
      glow: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.15)',
      accent: '#10b981',
    },
    warning: {
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
      iconColor: isDark ? '#fbbf24' : '#d97706',
      glow: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.15)',
      accent: '#f59e0b',
    },
    error: {
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
      iconColor: isDark ? '#f87171' : '#dc2626',
      glow: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.15)',
      accent: '#ef4444',
    },
    info: {
      bg: isDark ? 'rgba(6, 182, 212, 0.15)' : '#ecfeff',
      iconColor: isDark ? '#38bdf8' : '#0284c7',
      glow: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.15)',
      accent: '#06b6d4',
    },
    secondary: {
      bg: isDark ? 'rgba(20, 184, 166, 0.15)' : '#f0fdfa',
      iconColor: isDark ? '#2dd4bf' : '#0d9488',
      glow: isDark ? 'rgba(45, 212, 191, 0.2)' : 'rgba(15, 118, 110, 0.15)',
      accent: '#14b8a6',
    },
  };

  const style = colorStyles[color] || colorStyles.primary;

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: { xs: 130, sm: 140, md: 145 },
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.palette.divider,
        bgcolor: isDark ? 'background.paper' : '#ffffff',
        background: isDark
          ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.35)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isDark
            ? '0 12px 24px -4px rgba(0, 0, 0, 0.5)'
            : '0 12px 24px -4px rgba(0, 0, 0, 0.08)',
          borderColor: isDark ? alpha(style.accent, 0.4) : alpha(style.accent, 0.3),
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.25, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          '&:last-child': { pb: { xs: 2, sm: 2.25, md: 2.5 } },
        }}
      >
        {/* Top Header: Title on Left, Icon Badge on Right */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
            width: '100%',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.73rem',
              lineHeight: 1.3,
              minHeight: '2.6em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              flex: 1,
            }}
          >
            {title}
          </Typography>

          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '11px',
                background: style.bg,
                color: style.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 6px ${style.glow}`,
                flexShrink: 0,
              }}
            >
              {typeof icon === 'function' ||
              (typeof icon === 'object' && icon.$$typeof && !icon.props) ? (
                (() => {
                  const IconComp = icon;
                  return <IconComp sx={{ fontSize: 20, color: style.iconColor }} />;
                })()
              ) : (
                React.cloneElement(icon, {
                  sx: { fontSize: 20, color: style.iconColor, ...(icon.props?.sx || {}) },
                })
              )}
            </Box>
          )}
        </Box>

        {/* Hero Value Section (Full Card Width) */}
        <Box sx={{ my: 1.25, width: '100%' }}>
          {isValueLoading ? (
            <Skeleton
              variant="text"
              width="65%"
              height={36}
              sx={{ borderRadius: 1, transform: 'none' }}
            />
          ) : isCurrency ? (
            <CurrencyDisplay
              amount={value}
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{
                letterSpacing: '-0.025em',
                fontVariantNumeric: 'tabular-nums',
                fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.65rem' },
                lineHeight: 1.15,
                wordBreak: 'break-word',
              }}
            />
          ) : (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.025em',
                fontVariantNumeric: 'tabular-nums',
                fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.65rem' },
                lineHeight: 1.15,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
          )}
        </Box>

        {/* Footer: Trend Pill & Subtitle Context */}
        <Box
          sx={{
            mt: 'auto',
            pt: 0.5,
            minHeight: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            flexWrap: 'wrap',
          }}
        >
          {isValueLoading ? (
            <Skeleton
              variant="text"
              width="45%"
              height={18}
              sx={{ borderRadius: 1, transform: 'none' }}
            />
          ) : (
            <>
              {trend && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 0.9,
                    py: 0.2,
                    borderRadius: '6px',
                    bgcolor: isUp
                      ? isDark
                        ? 'rgba(16, 185, 129, 0.12)'
                        : alpha(theme.palette.success.main, 0.1)
                      : isDown
                      ? isDark
                        ? 'rgba(239, 68, 68, 0.12)'
                        : alpha(theme.palette.error.main, 0.1)
                      : isDark
                      ? 'rgba(148, 163, 184, 0.12)'
                      : alpha(theme.palette.text.secondary, 0.08),
                    color: isUp
                      ? isDark
                        ? '#34d399'
                        : '#059669'
                      : isDown
                      ? isDark
                        ? '#f87171'
                        : '#dc2626'
                      : 'text.secondary',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {isUp && <TrendingUpIcon sx={{ fontSize: 13 }} />}
                  {isDown && <TrendingDownIcon sx={{ fontSize: 13 }} />}
                  <span>{trend}</span>
                </Box>
              )}
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.73rem',
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
