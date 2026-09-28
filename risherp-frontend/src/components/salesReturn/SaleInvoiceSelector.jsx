import { useState } from 'react';
import {
  Box, Card, TextField, Button, InputAdornment, CircularProgress,
  Typography, Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import salesService from '../../services/salesService';

/**
 * SaleInvoiceSelector
 * Search bar that looks up an invoice by number and returns its full data.
 * Calls onSaleSelected(saleResponse) when a valid sale is found.
 */
const SaleInvoiceSelector = ({ onSaleSelected }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) { setError('Please enter an invoice number.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await salesService.getSaleByInvoiceNumber(trimmed);
      if (res?.success && res.data) {
        const sale = res.data;
        if (sale.status === 'CANCELLED') {
          setError('Cannot create return for a cancelled sale.');
        } else {
          onSaleSelected(sale);
        }
      } else {
        setError('Invoice not found.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invoice not found.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Step 1 — Search Original Invoice
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
        <TextField
          size="small"
          placeholder="Enter invoice number e.g. INV-000010"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          error={!!error}
          helperText={error}
          sx={{ minWidth: 300 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
          sx={{ minWidth: 120, mt: error ? '-20px' : 0 }}
        >
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </Stack>
    </Card>
  );
};

export default SaleInvoiceSelector;
