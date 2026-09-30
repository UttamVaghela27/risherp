import React from 'react';
import { Box } from '@mui/material';
import StatCard from '../common/StatCard';

/**
 * Responsive CSS Grid template columns based on total card count.
 * Guarantees 100% mathematically equal width for all cards across all screen sizes.
 */
const getGridTemplateColumns = (len) => {
  if (len === 1) return { xs: '1fr' };
  if (len === 2) return { xs: '1fr', sm: 'repeat(2, 1fr)' };
  if (len === 3) return { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' };
  if (len === 4) return { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' };
  if (len === 5) return { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' };
  if (len === 6) return { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' };
  return { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' };
};

/**
 * ReportSummaryCards — Responsive top-level summary metrics for reports.
 * Uses the standardized executive StatCard component across all reports.
 * cards = [{ title, value, icon, subtitle, color, trend, trendType, isCurrency }]
 */
const ReportSummaryCards = ({ cards = [], loading = false }) => {
  if (loading) {
    const skeletonCount = cards.length > 0 ? cards.length : 4;
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: getGridTemplateColumns(skeletonCount),
          gap: 2.5,
          mb: 3,
        }}
      >
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <StatCard key={idx} title="Loading..." value={null} loading={true} />
        ))}
      </Box>
    );
  }

  if (!cards || cards.length === 0) return null;

  const count = cards.length;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: getGridTemplateColumns(count),
        gap: 2.5,
        mb: 3,
      }}
    >
      {cards.map((c, idx) => (
        <StatCard
          key={c.title || idx}
          title={c.title}
          value={c.value ?? '-'}
          icon={c.icon}
          subtitle={c.subtitle}
          color={c.color || 'primary'}
          trend={c.trend}
          trendType={c.trendType}
          isCurrency={c.isCurrency}
        />
      ))}
    </Box>
  );
};

export default ReportSummaryCards;
