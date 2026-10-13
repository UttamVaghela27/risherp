import {
  Box, Card, Grid, Typography, Stack, Button, alpha, useTheme,
} from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import StatusChip from '../common/StatusChip';

/**
 * OriginalSalePreview
 * Shows selected sale's key details before creating the return.
 */
const OriginalSalePreview = ({ sale, onClear }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!sale) return null;

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
          <ReceiptOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Original Invoice — {sale.invoiceNumber}
          </Typography>
          <StatusChip status={sale.status} />
        </Stack>
        <Button size="small" color="error" onClick={onClear} variant="outlined" sx={{ ml: 2 }}>
          Change Invoice
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
            CUSTOMER
          </Typography>
          {infoRow('Name', sale.partyName)}
          {infoRow('Code', sale.partyCode)}
          {infoRow('Mobile', sale.partyMobile)}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
            INVOICE DETAILS
          </Typography>
          {infoRow('Invoice No.', sale.invoiceNumber)}
          {infoRow('Sale Date', sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-IN') : '—')}
          {infoRow('Payment Status', sale.paymentStatus)}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
            FINANCIALS
          </Typography>
          {infoRow('Grand Total', `₹ ${Number(sale.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)}
          {infoRow('Paid Amount', `₹ ${Number(sale.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)}
          {infoRow('Balance', `₹ ${Number(sale.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)}
        </Grid>
      </Grid>
    </Card>
  );
};

export default OriginalSalePreview;
