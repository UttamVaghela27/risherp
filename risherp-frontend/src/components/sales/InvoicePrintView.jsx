import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

const InvoicePrintView = ({ invoice }) => {
  if (!invoice) return null;
  const theme = useTheme();

  const companyName = invoice.businessName || 'ABC Enterprise';
  const companyMobile = invoice.businessMobile || '';
  const companyEmail = invoice.businessEmail || '';

  return (
    <Box
      className="printable-invoice"
      sx={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        p: { xs: 2, sm: 4 },
        maxWidth: 800,
        mx: 'auto',
        bgcolor: 'background.paper',
        color: theme.palette.text.primary,
        '@media print': { p: 0, m: 0, maxWidth: '100% !important', width: '100% !important' },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, gap: 2, mb: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{companyName}</Typography>
          <Typography variant="subtitle2" sx={{ color: '#1e3a8a', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.9rem' }}>
            TAX INVOICE / BILL
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
            Phone: {companyMobile} | Email: {companyEmail}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>{invoice.invoiceNumber}</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.25, fontSize: '0.85rem' }}>
            Date: {invoice.invoiceDate || '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.25, fontSize: '0.85rem' }}>
            Type: {invoice.invoiceType || 'CASH'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#047857', fontWeight: 700, fontSize: '0.85rem' }}>
            Payment: {invoice.paymentStatus || 'PAID'}
          </Typography>
        </Box>
      </Box>

      {/* Customer Block */}
      <Box sx={{ bgcolor: theme.palette.background.default, p: 1.5, mb: 3, mt: 1, borderTop: `1px solid ${theme.palette.divider}`, borderRadius: '6px' }}>
        <Typography variant="body2" sx={{ color: '#1e3a8a', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.75rem' }}>
          CUSTOMER / BILL TO DETAILS:
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.25, fontSize: '1.1rem' }}>{invoice.partyName}</Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.25, fontSize: '0.85rem' }}>
          {invoice.partyCode && `Customer Code: ${invoice.partyCode} | `}Phone: {invoice.partyMobile} | Email: {invoice.partyEmail}
        </Typography>
        {(invoice.partyAddress || invoice.partyCity) && (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
            Address: {[invoice.partyAddress, invoice.partyCity, invoice.partyState, invoice.partyPincode].filter(Boolean).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Items Table with horizontal scrolling container */}
      <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', mb: 2 }}>
        <Table sx={{ minWidth: 540, border: `1px solid ${theme.palette.divider}` }} size="small">
          <TableHead sx={{ bgcolor: theme.palette.background.default }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>ITEM DESCRIPTION</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>QTY</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>UNIT</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>RATE</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>DISCOUNT</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>AMOUNT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(invoice.items || []).map((item, idx) => (
              <TableRow key={item.id || idx}>
                <TableCell sx={{ color: theme.palette.text.primary, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>{idx + 1}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.itemNameSnapshot}</Typography>
                  {item.itemCodeSnapshot && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Code: {item.itemCodeSnapshot}</Typography>}
                </TableCell>
                <TableCell align="center" sx={{ color: theme.palette.text.primary, fontWeight: 700, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  {formatQuantity(item.quantity)}
                </TableCell>
                <TableCell align="center" sx={{ color: theme.palette.text.primary, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  {item.unitSnapshot}
                </TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>{formatCurrency(item.rate)}</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  {parseFloat(item.discountAmount) > 0 ? `- ${formatCurrency(item.discountAmount)}` : '—'}
                </TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, fontWeight: 700, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>{formatCurrency(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bottom Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: '48%' }, pt: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
            Payment Mode: {invoice.paymentMode || 'CASH'}
          </Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.secondary, borderBottom: 'none', py: 0.5, px: 0 }}>Subtotal:</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, borderBottom: 'none', py: 0.5, px: 0 }}>{formatCurrency(invoice.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.secondary, borderBottom: 'none', py: 0.5, px: 0 }}>Item Discount:</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, borderBottom: 'none', py: 0.5, px: 0 }}>- {formatCurrency(invoice.itemDiscount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.secondary, borderBottom: `1px solid ${theme.palette.divider}`, py: 0.5, px: 0 }}>Total Discount:</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}`, py: 0.5, px: 0 }}>- {formatCurrency(invoice.overallDiscount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', borderBottom: `1px solid ${theme.palette.divider}`, py: 1, px: 0, fontSize: '1rem' }}>Grand Total:</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', borderBottom: `1px solid ${theme.palette.divider}`, py: 1, px: 0, fontSize: '1rem' }}>{formatCurrency(invoice.grandTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.primary, borderBottom: 'none', py: 1, px: 0 }}>Paid Amount:</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#047857', borderBottom: 'none', py: 1, px: 0 }}>{formatCurrency(invoice.paidAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.primary, borderBottom: 'none', py: 0.5, px: 0 }}>Balance Payable:</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.secondary, borderBottom: 'none', py: 0.5, px: 0 }}>{formatCurrency(invoice.balanceAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePrintView;
