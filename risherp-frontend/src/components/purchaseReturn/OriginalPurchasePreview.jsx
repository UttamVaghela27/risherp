import {
  Box, Card, Grid, Typography, Stack, Button,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StatusChip from '../common/StatusChip';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function OriginalPurchasePreview({ purchase, onChangePurchase }) {
  const theme = useTheme();
  if (!purchase) return null;

  return (
    <Card
      sx={{
        p: 2.5,
        mb: 3,
        border: '1px solid',
        borderColor: 'primary.light',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(30, 58, 138, 0.15)' : 'rgba(30, 58, 138, 0.04)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ShoppingCartOutlinedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Original Purchase: {purchase.purchaseNumber}
          </Typography>
          <StatusChip status={purchase.status} />
        </Stack>
        {onChangePurchase && (
          <Button size="small" variant="outlined" color="primary" onClick={onChangePurchase}>
            Change Purchase
          </Button>
        )}
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">Supplier</Typography>
          <Typography variant="body2" fontWeight={600}>
            {purchase.partyName || purchase.party?.partyName || 'N/A'}
          </Typography>
          {purchase.partyCode && (
            <Typography variant="caption" color="text.secondary">
              Code: {purchase.partyCode}
            </Typography>
          )}
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <Typography variant="caption" color="text.secondary">Purchase Date</Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatDate(purchase.purchaseDate)}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <Typography variant="caption" color="text.secondary">Grand Total</Typography>
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {formatCurrency(purchase.grandTotal)}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <Typography variant="caption" color="text.secondary">Paid Amount</Typography>
          <Typography variant="body2" fontWeight={600} color="success.main">
            {formatCurrency(purchase.paidAmount || 0)}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={3} md={3}>
          <Typography variant="caption" color="text.secondary">Balance Payable</Typography>
          <Typography variant="body2" fontWeight={600} color="warning.dark">
            {formatCurrency(purchase.balanceAmount || 0)}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
