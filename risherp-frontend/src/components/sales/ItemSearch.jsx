import { useState, useRef } from 'react';
import {
  Autocomplete, TextField, Box, Typography, CircularProgress, Chip, InputAdornment
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import axiosInstance from '../../api/axiosInstance';

/**
 * ItemSearch
 * Smart item search field supporting:
 *  - Item name / code search (debounced)
 *  - Barcode scanner input (Enter key triggers exact barcode lookup)
 * Shows stock, unit, and rate in dropdown options.
 */
const ItemSearch = ({ onItemSelect, disabled }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const searchTimerRef = useRef(null);

  const searchItems = async (searchText) => {
    if (!searchText || searchText.trim().length < 1) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get('/items', {
        params: {
          search: searchText.trim(),
          status: 'ACTIVE',
          page: 0,
          size: 15,
          sortBy: 'itemName',
          sortDir: 'asc',
        },
      });
      if (response.data?.success) {
        setOptions(response.data.data?.content || []);
      }
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

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
        setOptions([]);
      }
    } catch {
      // Toast shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, newValue, reason) => {
    setInputValue(newValue);
    if (reason === 'input') {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => searchItems(newValue), 300);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      // Check if it looks like a barcode scan (no spaces, short quick entry)
      clearTimeout(searchTimerRef.current);
      lookupByBarcode(inputValue);
      event.stopPropagation();
    }
  };

  const getStockColor = (item) => {
    if (!item.currentStock || parseFloat(item.currentStock) <= 0) return 'error.main';
    if (parseFloat(item.currentStock) <= parseFloat(item.minimumStock || 0)) return 'warning.main';
    return 'success.main';
  };

  const getStockLabel = (item) => {
    const stock = parseFloat(item.currentStock) || 0;
    if (stock <= 0) return 'OUT OF STOCK';
    return `${stock % 1 === 0 ? stock.toFixed(0) : stock} ${item.unit}`;
  };

  return (
    <Autocomplete
      disabled={disabled}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      value={null}
      getOptionLabel={(option) => option?.itemName || ''}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      filterOptions={(x) => x}
      noOptionsText={inputValue.length > 0 ? 'No items found' : 'Search by name, code, or scan barcode...'}
      slotProps={{
        popper: { sx: { zIndex: 1500 } },
      }}
      onChange={(event, item) => {
        if (item) {
          if (item.status !== 'ACTIVE') return;
          if (parseFloat(item.currentStock) <= 0) return;
          onItemSelect(item);
          setInputValue('');
          setOptions([]);
        }
      }}
      getOptionDisabled={(option) =>
        option.status !== 'ACTIVE' || parseFloat(option.currentStock || 0) <= 0
      }
      renderOption={(props, option) => {
        const stock = parseFloat(option.currentStock) || 0;
        const outOfStock = stock <= 0;
        return (
          <Box component="li" {...props} key={option.id}
            sx={{ opacity: outOfStock ? 0.5 : 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {option.itemName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {option.itemCode}
                  {option.companyName ? ` • ${option.companyName}` : ''}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  ₹{parseFloat(option.saleRate).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" sx={{ color: getStockColor(option), fontWeight: 600 }}>
                  {getStockLabel(option)}
                </Typography>
              </Box>
            </Box>
            {outOfStock && (
              <Chip label="OUT OF STOCK" size="small" color="error"
                sx={{ mt: 0.5, fontSize: 10, height: 18 }} />
            )}
          </Box>
        );
      }}
      renderInput={({ InputProps, inputProps, ...restParams }) => (
        <TextField
          {...restParams}
          label="Scan barcode or search item..."
          placeholder="Item name, code, or scan barcode (press Enter)"
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

export default ItemSearch;
