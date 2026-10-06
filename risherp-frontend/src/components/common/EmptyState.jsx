import React from 'react';
import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

const EmptyState = ({
  title,
  message = 'No data found',
  icon = InboxOutlinedIcon,
  actionLabel,
  onAction,
  minHeight = 280,
}) => {
  const theme = useTheme();

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon;
    return (
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.06),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <IconComponent
          sx={{
            fontSize: 34,
            color: alpha(theme.palette.primary.main, 0.5),
          }}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        p: 4,
        textAlign: 'center',
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
      }}
    >
      {renderIcon()}
      {title && (
        <Typography
          variant="subtitle1"
          fontWeight={650}
          color="text.primary"
          sx={{ mb: 0.5 }}
        >
          {title}
        </Typography>
      )}
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 380, lineHeight: 1.6 }}
        >
          {message}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{ mt: 2.5, px: 3 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
