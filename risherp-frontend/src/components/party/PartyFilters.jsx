import { TextField, InputAdornment, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterBar from '../common/FilterBar';

/**
 * PartyFilters Component
 * Reusable filter bar for Party, Customer, and Supplier listings.
 */
const PartyFilters = ({
  search = '',
  onSearchChange,
  type = 'ALL',
  onTypeChange,
  status = 'ALL',
  onStatusChange,
  onReset,
  hideTypeFilter = false,
}) => {
  const isFiltered = search.trim() !== '' || (type !== 'ALL' && !hideTypeFilter) || status !== 'ALL';

  return (
    <FilterBar isFiltered={isFiltered} onReset={onReset}>
      {/* Search Field */}
      <TextField
        size="small"
        placeholder="Search by party name, code, or mobile..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: { xs: 1, sm: 2 }, minWidth: 240 }}
      />

      {/* Party Type Filter (if not locked to Customer/Supplier) */}
      {!hideTypeFilter && (
        <TextField
          select
          size="small"
          label="Party Type"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="ALL">All Types</MenuItem>
          <MenuItem value="CUSTOMER">Customer</MenuItem>
          <MenuItem value="SUPPLIER">Supplier</MenuItem>
          <MenuItem value="BOTH">Both</MenuItem>
        </TextField>
      )}

      {/* Status Filter */}
      <TextField
        select
        size="small"
        label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        sx={{ minWidth: 130 }}
      >
        <MenuItem value="ALL">All Status</MenuItem>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="INACTIVE">Inactive</MenuItem>
      </TextField>
    </FilterBar>
  );
};

export default PartyFilters;
