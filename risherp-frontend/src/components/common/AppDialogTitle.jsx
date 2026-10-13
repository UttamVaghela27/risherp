import { Box, DialogTitle, IconButton, Typography, useTheme, alpha } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Standard modal header — use across entity dialogs for consistent UI.
 */
const AppDialogTitle = ({
  title,
  subtitle,
  icon,
  onClose,
  color = 'primary',
}) => {
  const theme = useTheme();
  const paletteColor = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <DialogTitle
      component="div"
      sx={{
        m: 0,
        px: 3,
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, minWidth: 0 }}>
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(paletteColor, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: `${color}.main`,
              border: `1px solid ${alpha(paletteColor, 0.25)}`,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={650} color="text.primary" sx={{ lineHeight: 1.3 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary', mt: -0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </DialogTitle>
  );
};

export default AppDialogTitle;
