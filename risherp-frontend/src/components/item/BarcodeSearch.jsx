import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import itemService from '../../services/itemService';

/**
 * BarcodeSearch Component
 * Reusable barcode scanner and lookup widget for Item Master,
 * POS Billing (Phase 7), Purchase Entry (Phase 9), and Stock Adjustment (Phase 12).
 */
const BarcodeSearch = ({
  onItemFound,
  onError,
  autoClearOnSuccess = false,
  showPreview = true,
  placeholder = 'Scan or enter barcode...',
}) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFoundItem, setLastFoundItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLookup = async (codeToSearch) => {
    const code = (codeToSearch || barcode).trim();
    if (!code) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await itemService.findItemByBarcode(code);
      if (res?.success && res.data) {
        setLastFoundItem(res.data);
        setErrorMsg(null);
        if (onItemFound) onItemFound(res.data);
        if (autoClearOnSuccess) setBarcode('');
      } else {
        setErrorMsg('Item not found for this barcode');
        if (onError) onError('Item not found');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Item not found for this barcode';
      setErrorMsg(msg);
      setLastFoundItem(null);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };

  const handleClear = () => {
    setBarcode('');
    setLastFoundItem(null);
    setErrorMsg(null);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 450 }}>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <QrCodeScannerIcon color="primary" fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={18} />
              ) : barcode ? (
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => handleLookup()}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : null}
            </InputAdornment>
          ),
        }}
      />

      {errorMsg && (
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
          {errorMsg}
        </Typography>
      )}

      {showPreview && lastFoundItem && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mt: 1,
            bgcolor: 'background.default',
            border: '1px solid #cbd5e1',
            borderRadius: 1.5,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" fontWeight={700}>
                {lastFoundItem.itemName}
              </Typography>
              <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                {lastFoundItem.itemCode} | Barcode: {lastFoundItem.barcode}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={`₹ ${lastFoundItem.saleRate || 0}`}
              color="primary"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default BarcodeSearch;
