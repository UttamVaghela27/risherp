import {
  Box, Card, Grid, Typography, Stack, Button, alpha, useTheme,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StatusChip from '../common/StatusChip';
import { formatDate } from '../../utils/formatters';

export default function OriginalPurchasePreview({ purchase, onChangePurchase }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!purchase) return null;

  const infoRow = (label, value) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" fontWeight={600}>{value || '—'}</Typography>
    </Box>
  );

  return (
    <Card
      sx={{
        p: 2.5,
        mb: 2.5,
        border: '1px solid',
        borderColor: isDark ? alpha(theme.palette.primary.main, 0.3) : '#c7d2fe',
        borderRadius: 2,
        bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : '#f5f3ff',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ShoppingCartOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Original Purchase — {purchase.purchaseNumber}
          </Typography>
          <StatusChip status={purchase.status} />
        </Stack>
        {onChangePurchase && (
          <Button size="small" color="error" onClick={onChangePurchase} variant="outlined" sx={{ ml: 2 }}>
            Change Purchase
          </Button>
        )}
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
            SUPPLIER
          </Typography>
          {infoRow('Name', purchase.partyName || purchase.party?.partyName)}
          {infoRow('Code', purchase.partyCode || purchase.party?.partyCode)}
          {infoRow('Mobile', purchase.partyMobile || purchase.party?.mobile)}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
            PURCHASE DETAILS
          </Typography>
          {infoRow('Purchase No.', purchase.purchaseNumber)}
          {infoRow('Purchase Date', formatDate(purchase.purchaseDate))}
          {infoRow('Payment Status', purchase.paymentStatus || purchase.status)}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
            FINANCIALS
          </Typography>
          {infoRow('Grand Total', `₹ ${Number(purchase.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)}
          {infoRow('Paid Amount', `₹ ${Number(purchase.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)}
          {infoRow('Balance', `₹ ${Number(purchase.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)}
        </Grid>
      </Grid>
    </Card>
  );
}
