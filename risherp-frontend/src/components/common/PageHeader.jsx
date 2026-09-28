import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

/**
 * PageHeader Component
 * Standardized executive header for every module and page across RISHERP.
 * 
 * Props:
 * - title: string (Main page title)
 * - description: string (Short contextual subtitle)
 * - subtitle: string (Alias for description)
 * - action: { label, icon, onClick, variant, color } OR ReactNode (Primary CTA / Action Buttons)
 * - secondaryAction: { label, icon, onClick, variant, color } (Secondary CTA)
 * - children: ReactNode (Custom slots/filters if needed)
 */
const PageHeader = ({
  title,
  description,
  subtitle,
  action,
  actions,
  secondaryAction,
  children,
}) => {
  const contextText = description || subtitle;

  const actionList = actions
    ? (Array.isArray(actions) ? actions : [actions])
    : (action ? [action] : []);

  const renderActionButton = (act, key) => {
    if (!act) return null;
    if (React.isValidElement(act)) {
      return React.cloneElement(act, { key: key ?? act.key });
    }
    return (
      <Button
        key={key ?? act.label}
        variant={act.variant || 'contained'}
        color={act.color || 'primary'}
        startIcon={act.icon}
        onClick={act.onClick}
        sx={{
          px: 2.5,
          py: 0.9,
          borderRadius: 2,
          fontWeight: 650,
          boxShadow: act.variant === 'outlined' ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.25)',
          whiteSpace: 'nowrap',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        }}
      >
        {act.label}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3.5,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.025em',
            fontSize: { xs: '1.25rem', sm: '1.45rem' },
          }}
        >
          {title}
        </Typography>
        {contextText && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              fontSize: '0.85rem',
              fontWeight: 450,
            }}
          >
            {contextText}
          </Typography>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          width: { xs: '100%', md: 'auto' }
        }}
      >
        {children}

        {secondaryAction && (
          <Button
            variant={secondaryAction.variant || 'outlined'}
            color={secondaryAction.color || 'inherit'}
            startIcon={secondaryAction.icon}
            onClick={secondaryAction.onClick}
            sx={{
              px: 2,
              py: 0.9,
              borderRadius: 2,
              fontWeight: 600,
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.primary',
              },
            }}
          >
            {secondaryAction.label}
          </Button>
        )}

        {actionList.map((act, idx) => renderActionButton(act, idx))}
      </Stack>
    </Box>
  );
};

export default PageHeader;
