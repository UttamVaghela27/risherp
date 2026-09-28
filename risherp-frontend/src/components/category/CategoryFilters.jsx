import { TextField, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterBar from '../common/FilterBar';

/**
 * CategoryFilters Component
 * Filter bar for category search and status filtering.
 */
const CategoryFilters = ({
  search = '',
  status = 'ALL',
  onSearchChange,
  onStatusChange,
  onReset,
}) => {
  const isFiltered = search.trim() !== '' || status !== 'ALL';

  return (
    <FilterBar isFiltered={isFiltered} onReset={onReset}>
      <TextField
        placeholder="Search categories..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{ minWidth: { xs: '100%', sm: 280 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        size="small"
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="ALL">All Status</MenuItem>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="INACTIVE">Inactive</MenuItem>
      </TextField>
    </FilterBar>
  );
};

export default CategoryFilters;
