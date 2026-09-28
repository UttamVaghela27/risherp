import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Autocomplete, TextField, Box, Typography, CircularProgress, Chip, InputAdornment
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import axiosInstance from '../../api/axiosInstance';

/**
 * PurchaseItemSearch
 * Item search field supporting:
 *  - Item name / code search (debounced)
 *  - Barcode scanner input (Enter key triggers exact barcode lookup)
 * Shows current stock, unit, and default purchase rate in dropdown options.
 * Allows selecting items with zero or low stock since purchases replenish inventory.
 */
const PurchaseItemSearch = ({ onItemSelect, disabled }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const searchTimerRef = useRef(null);

  const searchItems = useCallback(async (searchText = '') => {
    setLoading(true);
    try {
      const params = {
        status: 'ACTIVE',
        page: 0,
        size: 30,
        sortBy: 'itemName',
        sortDir: 'asc',
      };
      if (searchText && searchText.trim().length > 0) {
        params.search = searchText.trim();
      }
      const response = await axiosInstance.get('/items', { params });
      if (response.data?.success) {
        setOptions(response.data.data?.content || []);
      }
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    searchItems('');
  }, [searchItems]);

  const lookupByBarcode = async (barcode) => {
    if (!barcode || !barcode.trim()) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/items/barcode/${encodeURIComponent(barcode.trim())}`);
      if (response.data?.success && response.data.data) {
        const item = response.data.data;
        if (item.status !== 'ACTIVE') {
          return;
        }
        onItemSelect(item);
        setInputValue('');
        searchItems('');
      }
    } catch {
      // Handled by toast interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, newValue, reason) => {
    setInputValue(newValue);
    if (reason === 'reset') return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => searchItems(newValue), 300);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      lookupByBarcode(inputValue);
      event.stopPropagation();
    }
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      value={null}
      getOptionLabel={(option) => {
        if (!option) return '';
        if (typeof option === 'string') return option;
        return option.itemName ? `${option.itemName} (${option.itemCode || ''})` : '';
      }}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      filterOptions={(x) => x}
      noOptionsText={loading ? 'Searching items...' : 'No active items found'}
      slotProps={{
        popper: { sx: { zIndex: 1500 } },
      }}
      onChange={(event, item) => {
        if (item && item.status === 'ACTIVE') {
          onItemSelect(item);
          setInputValue('');
        }
      }}
      getOptionDisabled={(option) => option.status !== 'ACTIVE'}
      renderOption={(props, option) => {
        const stock = parseFloat(option.currentStock) || 0;
        const purchaseRate = parseFloat(option.purchaseRate) || 0;
        return (
          <Box component="li" {...props} key={option.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 1, py: 0.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {option.itemName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {option.itemCode} • Unit: {option.unit}
                  {option.companyName ? ` • ${option.companyName}` : ''}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  ₹{purchaseRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Stock: {stock % 1 === 0 ? stock.toFixed(0) : stock} {option.unit}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      }}
      renderInput={({ InputProps, inputProps, ...restParams }) => (
        <TextField
          {...restParams}
          label="Search items..."
          placeholder="Type item name, code, or scan barcode..."
          onKeyDown={handleKeyDown}
          inputProps={inputProps}
          InputProps={{
            ...InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <QrCodeScannerIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {InputProps?.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default PurchaseItemSearch;
