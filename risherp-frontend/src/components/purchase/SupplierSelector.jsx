import { useState, useEffect, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress, Chip } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import axiosInstance from '../../api/axiosInstance';

/**
 * SupplierSelector
 * MUI Autocomplete with server-side search for Party (SUPPLIER or BOTH, ACTIVE only).
 * Debounced search by supplier name, code, or mobile.
 */
const SupplierSelector = ({ value, onChange, error, helperText, disabled }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const searchTimeout = useRef(null);

  const searchSuppliers = useCallback(async (searchText = '') => {
    setLoading(true);
    try {
      const params = {
        status: 'ACTIVE',
        page: 0,
        size: 30,
      };
      if (searchText && searchText.trim().length > 0) {
        params.search = searchText.trim();
      }
      const response = await axiosInstance.get('/parties', { params });
      if (response.data?.success) {
        const parties = response.data.data?.content || [];
        // Filter: only active SUPPLIER or BOTH party types
        setOptions(parties.filter(p =>
          (p.partyType === 'SUPPLIER' || p.partyType === 'BOTH') && p.status === 'ACTIVE'
        ));
      }
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount so dropdown has suppliers immediately
  useEffect(() => {
    searchSuppliers('');
  }, [searchSuppliers]);

  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    if (reason === 'reset') return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchSuppliers(newInputValue);
    }, 300);
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      value={value || null}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      getOptionLabel={(option) => {
        if (!option) return '';
        if (typeof option === 'string') return option;
        return option.partyName ? `${option.partyName} (${option.partyCode || ''})` : '';
      }}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      filterOptions={(x) => x} // Server-side search — disable client filtering
      noOptionsText={loading ? 'Searching suppliers...' : 'No active suppliers found'}
      slotProps={{
        popper: { sx: { zIndex: 1500 } },
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', py: 0.5 }}>
            <LocalShippingOutlinedIcon sx={{ color: 'primary.main', fontSize: 22, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.partyName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {option.partyCode} • {option.mobile || 'No Mobile'}
                {option.city ? ` • ${option.city}` : ''}
              </Typography>
            </Box>
            {option.partyType === 'BOTH' && (
              <Chip label="BOTH" size="small" sx={{ fontSize: 10, height: 18 }} />
            )}
            <Chip label="SUPPLIER" size="small" color="primary" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
          </Box>
        </Box>
      )}
      renderInput={({ InputProps, inputProps, ...restParams }) => (
        <TextField
          {...restParams}
          fullWidth
          label="Supplier"
          placeholder="Search by name, code, or mobile..."
          error={error}
          helperText={helperText}
          inputProps={inputProps}
          InputProps={{
            ...InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {InputProps?.endAdornment}
              </>
            ),
          }}
          InputLabelProps={{ shrink: true }}
          sx={{
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              height: '52px',
            },
          }}
        />
      )}
    />
  );
};

export default SupplierSelector;
