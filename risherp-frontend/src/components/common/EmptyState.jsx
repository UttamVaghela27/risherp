import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

/**
 * Reusable Empty State
 * 
 * Shows when a list/table has no data.
 * Supports both component references and pre-rendered JSX elements for the icon prop.
 * Usage: <EmptyState title="No items" message="No parties found" />
 */
const EmptyState = ({
  title,
  message = 'No data found',
  icon = InboxIcon,
  actionLabel,
  onAction,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon;
    return <IconComponent sx={{ fontSize: 56, color: 'text.disabled', opacity: 0.5 }} />;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '250px',
        gap: 1,
        p: 3,
        textAlign: 'center',
      }}
    >
      {renderIcon()}
      {title && (
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          {title}
        </Typography>
      )}
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{ mt: 1, textTransform: 'none' }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
