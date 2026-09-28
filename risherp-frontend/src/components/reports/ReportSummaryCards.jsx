import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

/**
 * ReportSummaryCards — Responsive top-level summary metrics for reports.
 * cards = [{ title, value, icon, subtitle, color }]
 */
const ReportSummaryCards = ({ cards = [], loading = false }) => {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((n) => (
          <Grid item xs={12} sm={6} md={3} key={n}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!cards || cards.length === 0) return null;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((c, idx) => (
        <Grid item xs={12} sm={6} md={12 / Math.min(cards.length, 6)} key={idx}>
          <Card
            sx={{
              height: '100%',
              border: 1, borderColor: 'divider',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 1.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                borderColor: c.color ? `${c.color}.main` : 'primary.main',
              },
            }}
          >
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {c.title}
                </Typography>
                {c.icon && (
                  <Box
                    sx={{
                      p: 0.8,
                      borderRadius: 1.5,
                      bgcolor: c.color ? `${c.color}.50` : 'primary.50',
                      color: c.color ? `${c.color}.main` : 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {c.icon}
                  </Box>
                )}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', my: 0.5 }}>
                {c.value ?? '-'}
              </Typography>

              {c.subtitle && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {c.subtitle}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportSummaryCards;
