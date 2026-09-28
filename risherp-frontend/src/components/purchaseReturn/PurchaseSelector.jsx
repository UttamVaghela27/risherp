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

  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = purchaseNumber.trim();
    if (!query) {
      toast.error('Please enter a purchase number');
      return;
    }

    setLoading(true);
    try {
      const response = await purchaseService.getPurchaseByNumber(query);
      const purchase = response.data || response;
      if (!purchase || !purchase.id) {
        toast.error(`Purchase "${query}" not found.`);
        return;
      }
      if (purchase.status === 'CANCELLED') {
        toast.error(`Purchase "${purchase.purchaseNumber}" is cancelled. Cannot create return.`);
        return;
      }
      onPurchaseSelected(purchase);
    } catch (err) {
      const msg = err.response?.data?.message || `Purchase "${query}" not found.`;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Select Original Purchase
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search by purchase number (e.g. <code>PUR-000001</code>) to load purchased items and available return quantities.
      </Typography>
      <form onSubmit={handleSearch}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Enter Purchase Number (e.g. PUR-000001)"
            value={purchaseNumber}
            onChange={(e) => setPurchaseNumber(e.target.value)}
            disabled={disabled || loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled || loading || !purchaseNumber.trim()}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{ minWidth: 120, height: 40, whiteSpace: 'nowrap' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
