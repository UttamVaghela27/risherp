import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, useTheme, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CurrencyDisplay from './CurrencyDisplay';

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
  const isUp = trendType === 'up';
  const isDown = trendType === 'down';
  const paletteColor = theme.palette[color]?.main || theme.palette.primary.main;

  const isValueLoading = loading || value === null || value === undefined || value === '—';

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: { xs: 128, sm: 136 },
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: alpha(paletteColor, 0.35),
          boxShadow:
            theme.palette.mode === 'light'
              ? `0 4px 16px ${alpha(paletteColor, 0.12)}`
              : `0 4px 16px ${alpha('#000', 0.4)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: paletteColor,
          opacity: 0.85,
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 650,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.7rem',
              lineHeight: 1.35,
              flex: 1,
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: alpha(paletteColor, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                color: paletteColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon, { sx: { fontSize: 20, ...(icon.props?.sx || {}) } })
                : (() => {
                    const IconComp = icon;
                    return <IconComp sx={{ fontSize: 20 }} />;
                  })()}
            </Box>
          )}
        </Box>

        {isValueLoading ? (
          <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1 }} />
        ) : isCurrency ? (
          <CurrencyDisplay
            amount={value}
            variant="h5"
            fontWeight={700}
            color="text.primary"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              fontSize: { xs: '1.35rem', md: '1.5rem' },
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              fontSize: { xs: '1.35rem', md: '1.5rem' },
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            {value}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minHeight: 22 }}>
          {!isValueLoading && trend && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.35,
                px: 0.75,
                py: 0.15,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 650,
                bgcolor: isUp
                  ? alpha(theme.palette.success.main, 0.12)
                  : isDown
                  ? alpha(theme.palette.error.main, 0.12)
                  : alpha(theme.palette.text.secondary, 0.1),
                color: isUp ? 'success.dark' : isDown ? 'error.dark' : 'text.secondary',
              }}
            >
              {isUp && <TrendingUpIcon sx={{ fontSize: 12 }} />}
              {isDown && <TrendingDownIcon sx={{ fontSize: 12 }} />}
              {trend}
            </Box>
          )}
          {!isValueLoading && subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
