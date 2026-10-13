import { Box, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, Chip, useTheme
} from '@mui/material';
import { formatCurrency } from '../../utils/saleCalculations';

/**
 * InvoicePreview — print-ready invoice template.
 * Used in SaleDetails view and triggered via window.print() for printing.
 * CSS class 'printable-invoice' is targeted by @media print styles.
 */
const InvoicePreview = ({ sale, businessName = 'RISHERP Business' }) => {
  const theme = useTheme();
  if (!sale) return null;

  const getPaymentStatusColor = (status) => {
    if (status === 'PAID') return '#16a34a';
    if (status === 'PARTIAL') return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box
      className="printable-invoice"
      sx={{
        fontFamily: '"Inter", "Roboto", sans-serif',
        p: 4,
        maxWidth: 800,
        mx: 'auto',
        bgcolor: 'background.paper',
        '@media print': {
          p: 2,
          maxWidth: '100%',
          boxShadow: 'none',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
            {businessName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tax Invoice / Bill of Supply
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" fontWeight={700}>
            {sale.invoiceNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date: {sale.saleDate}
          </Typography>
          <Chip
            label={sale.paymentStatus}
            size="small"
            sx={{
              mt: 0.5,
              bgcolor: getPaymentStatusColor(sale.paymentStatus),
              color: 'white',
              fontWeight: 700,
              fontSize: 11,
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Customer Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Bill To
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
          {sale.partyName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {sale.partyCode && `Code: ${sale.partyCode}`}
          {sale.partyMobile && ` • Mobile: ${sale.partyMobile}`}
          {sale.partyCity && ` • ${sale.partyCity}`}
        </Typography>
      </Box>

      {/* Items Table */}
      <Table size="small" sx={{ mb: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <TableHead sx={{ bgcolor: 'background.default' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>ITEM</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'center' }}>QTY</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'center' }}>UNIT</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'right' }}>RATE</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'right' }}>DISCOUNT</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'right' }}>AMOUNT</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(sale.items || []).map((item, idx) => (
            <TableRow key={item.id || idx}>
              <TableCell sx={{ fontSize: 12 }}>{idx + 1}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{item.itemNameSnapshot}</Typography>
                <Typography variant="caption" color="text.secondary">{item.itemCodeSnapshot}</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontSize: 12 }}>
                {parseFloat(item.quantity) % 1 === 0
                  ? parseInt(item.quantity)
                  : parseFloat(item.quantity).toFixed(3)}
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontSize: 12 }}>{item.unitSnapshot}</TableCell>
              <TableCell sx={{ textAlign: 'right', fontSize: 12 }}>{formatCurrency(item.rate)}</TableCell>
              <TableCell sx={{ textAlign: 'right', fontSize: 12, color: '#16a34a' }}>
                {parseFloat(item.discountAmount) > 0 ? `-${formatCurrency(item.discountAmount)}` : '—'}
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 600, fontSize: 12 }}>
                {formatCurrency(item.lineTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Totals Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Box sx={{ minWidth: 280 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2" fontWeight={600}>{formatCurrency(sale.subtotal)}</Typography>
          </Box>
          {parseFloat(sale.itemDiscount) > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" color="text.secondary">Item Discount</Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">-{formatCurrency(sale.itemDiscount)}</Typography>
            </Box>
          )}
          {parseFloat(sale.overallDiscount) > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" color="text.secondary">Overall Discount</Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">-{formatCurrency(sale.overallDiscount)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="subtitle2" fontWeight={800}>Grand Total</Typography>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main">{formatCurrency(sale.grandTotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Paid ({sale.paymentMode || '—'})</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">{formatCurrency(sale.paidAmount)}</Typography>
          </Box>
          {parseFloat(sale.balanceAmount) > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="error.main" fontWeight={600}>Balance</Typography>
              <Typography variant="body2" fontWeight={700} color="error.main">{formatCurrency(sale.balanceAmount)}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Notes */}
      {sale.notes && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>NOTES</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>{sale.notes}</Typography>
        </Box>
      )}

      {/* Footer */}
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Generated by RISHERP • {sale.createdAt ? new Date(sale.createdAt).toLocaleString('en-IN') : ''}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ borderTop: '1px solid #333', pt: 0.5, minWidth: 150 }}>
            <Typography variant="caption">Authorised Signature</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePreview;
