import { useState } from 'react';
import {
  Card, TextField, Button, InputAdornment, CircularProgress,
  Typography, Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import purchaseService from '../../services/purchaseService';
import toast from 'react-hot-toast';

export default function PurchaseSelector({ onPurchaseSelected, disabled = false }) {
  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = purchaseNumber.trim();
    if (!query) {
      setError('Please enter a purchase number.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await purchaseService.getPurchaseByNumber(query);
      const purchase = response.data || response;
      if (!purchase || !purchase.id) {
        setError(`Purchase "${query}" not found.`);
        return;
      }
      if (purchase.status === 'CANCELLED') {
        setError(`Purchase "${purchase.purchaseNumber}" is cancelled. Cannot create return.`);
        return;
      }
      onPurchaseSelected(purchase);
    } catch (err) {
      const msg = err.response?.data?.message || `Purchase "${query}" not found.`;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Step 1 — Search Original Purchase
      </Typography>
      <form onSubmit={handleSearch}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
          <TextField
            size="small"
            placeholder="Enter purchase number e.g. PUR-000001"
            value={purchaseNumber}
            onChange={(e) => {
              setPurchaseNumber(e.target.value);
              setError('');
            }}
            disabled={disabled || loading}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 320 } }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled || loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{ minWidth: 120, mt: error ? '-20px' : 0 }}
          >
            {loading ? 'Searching…' : 'Search'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
