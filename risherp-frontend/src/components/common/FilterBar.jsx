import React from 'react';
import { Box, Button, useTheme } from '@mui/material';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';

/**
 * FilterBar Component
 * A reusable container for search bars and select dropdowns used across list pages.
 * Fully themable and compatible with dark/light modes.
 */
const FilterBar = ({ children, isFiltered = false, onReset }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        mb: 2.5,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 300 }, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        {children}
      </Box>

      {/* Reset Filter Button */}
      {isFiltered && onReset && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<FilterAltOffOutlinedIcon fontSize="small" />}
          onClick={onReset}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 1.5, 
            width: { xs: '100%', sm: 'auto' },
            color: 'text.secondary', 
            borderColor: theme.palette.divider,
            '&:hover': {
              borderColor: 'text.primary',
              bgcolor: theme.palette.action.hover,
            }
          }}
        >
          Reset Filters
        </Button>
      )}
    </Box>
  );
};

export default FilterBar;
