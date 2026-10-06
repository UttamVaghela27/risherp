import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

const FilterBar = ({ children, isFiltered = false, onReset, title = 'Filters' }) => {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {isFiltered && onReset && (
          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<FilterAltOffOutlinedIcon fontSize="small" />}
            onClick={onReset}
            sx={{ color: 'text.secondary' }}
          >
            Reset
          </Button>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default FilterBar;
