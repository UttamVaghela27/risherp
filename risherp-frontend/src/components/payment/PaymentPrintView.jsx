import { Box, Typography, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const PaymentPrintView = ({ payment }) => {
  if (!payment) return null;

  const companyName = payment.businessName || 'ABC Enterprise';
  const companyMobile = payment.businessMobile || '';
  const companyEmail = payment.businessEmail || '';
  
  const totalAmount = Number(payment.amount || 0);
  const unallocated = Number(payment.unallocatedAmount || 0);

  return (
    <Box
      className="printable-payment"
      sx={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        p: { xs: 1.5, sm: 3, md: 4 },
        maxWidth: 800,
        mx: 'auto',
        bgcolor: 'background.paper',
        color: '#000000',
        '@media print': { p: 0, m: 0, maxWidth: '100% !important', width: '100% !important' },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{companyName}</Typography>
          <Typography variant="subtitle2" sx={{ color: '#1e3a8a', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.9rem' }}>
            SUPPLIER PAYMENT VOUCHER
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            Email: {companyEmail} &nbsp; Mobile: {companyMobile}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>{payment.paymentNumber}</Typography>
          <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>
            Payment Date: {payment.paymentDate || '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem' }}>
            Payment Mode: {payment.paymentMode?.replace('_', ' ') || '—'}
          </Typography>
        </Box>
      </Box>

      {/* Supplier Block */}
      <Box sx={{ bgcolor: '#f0f4f8', p: 1.5, mb: 3, mt: 1, borderTop: '1px solid #d1d5db' }}>
        <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.5, fontSize: '0.8rem' }}>Paid To (Supplier / Vendor)</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{payment.partyName}</Typography>
        <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>Mobile: {payment.partyMobile}</Typography>
        <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>Email: {payment.partyEmail}</Typography>
        {(payment.partyAddress || payment.partyCity) && (
          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem' }}>
            Address: {[payment.partyAddress, payment.partyCity, payment.partyState].filter(Boolean).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Totals Table */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Table sx={{ width: { xs: '100%', sm: '60%', md: '50%' }, border: '1px solid #e5e7eb' }} size="small">
          <TableBody>
            <TableRow sx={{ bgcolor: '#eff6ff' }}>
              <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', borderBottom: '1px solid #e5e7eb', py: 1 }}>TOTAL PAID</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', borderBottom: '1px solid #e5e7eb', py: 1 }}>{formatCurrency(totalAmount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>Supplier Advance / Debit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>{formatCurrency(unallocated)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Footer */}
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.8rem', borderTop: '1px solid #e5e7eb', pt: 1 }}>
        This is an official computer-generated payment voucher. No signature required.
      </Typography>
    </Box>
  );
};

export default PaymentPrintView;
