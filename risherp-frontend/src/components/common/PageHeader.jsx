import React from 'react';
import { Box, Typography, Button, Stack, useTheme, alpha } from '@mui/material';

const PageHeader = ({
  title,
  description,
  subtitle,
  action,
  actions,
  secondaryAction,
  children,
}) => {
  const theme = useTheme();
  const contextText = description || subtitle;

  const actionList = actions
    ? Array.isArray(actions)
      ? actions
      : [actions]
    : action
    ? [action]
    : [];

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
        size={act.size || 'medium'}
        disabled={act.disabled}
        sx={act.sx}
      >
        {act.label}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      {/* Left — Title & Description */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        {contextText && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.35, lineHeight: 1.5 }}
          >
            {contextText}
          </Typography>
        )}
      </Box>

      {/* Right — Actions */}
      {(children || secondaryAction || actionList.length > 0) && (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          alignItems="center"
          useFlexGap
          sx={{ flexShrink: 0 }}
        >
          {children}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outlined'}
              color={secondaryAction.color || 'inherit'}
              startIcon={secondaryAction.icon}
              onClick={secondaryAction.onClick}
              size={secondaryAction.size || 'medium'}
              disabled={secondaryAction.disabled}
              sx={{
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.secondary',
                  bgcolor: alpha(theme.palette.text.secondary, 0.05),
                },
                ...secondaryAction.sx,
              }}
            >
              {secondaryAction.label}
            </Button>
          )}
          {actionList.map((act, idx) => renderActionButton(act, idx))}
        </Stack>
      )}
    </Box>
  );
};

export default PageHeader;
