import { Box, Typography, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const ReceiptPrintView = ({ receipt }) => {
  if (!receipt) return null;

  const companyName = receipt.businessName || 'ABC Enterprise';
  const companyMobile = receipt.businessMobile || '';
  const companyEmail = receipt.businessEmail || '';
  
  const totalAmount = Number(receipt.amount || 0);
  const unallocated = Number(receipt.unallocatedAmount || 0);

  return (
    <Box
      className="printable-receipt"
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
          <Typography variant="subtitle2" sx={{ color: '#047857', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.9rem' }}>
            CUSTOMER PAYMENT RECEIPT
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            Email: {companyEmail} &nbsp; Mobile: {companyMobile}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#047857', mb: 1 }}>{receipt.receiptNumber}</Typography>
          <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>
            Receipt Date: {receipt.receiptDate || '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem' }}>
            Payment Mode: {receipt.paymentMode?.replace('_', ' ') || '—'}
          </Typography>
        </Box>
      </Box>

      {/* Customer Block */}
      <Box sx={{ bgcolor: '#f0fdf4', p: 1.5, mb: 3, mt: 1, borderTop: '1px solid #d1d5db' }}>
        <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.5, fontSize: '0.8rem' }}>Received From (Customer)</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{receipt.partyName}</Typography>
        <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>Mobile: {receipt.partyMobile}</Typography>
        <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>Email: {receipt.partyEmail}</Typography>
        {(receipt.partyAddress || receipt.partyCity) && (
          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem' }}>
            Address: {[receipt.partyAddress, receipt.partyCity, receipt.partyState].filter(Boolean).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Totals Table */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Table sx={{ width: { xs: '100%', sm: '60%', md: '50%' }, border: '1px solid #e5e7eb' }} size="small">
          <TableBody>
            <TableRow sx={{ bgcolor: '#ecfdf5' }}>
              <TableCell sx={{ fontWeight: 700, color: '#047857', borderBottom: '1px solid #e5e7eb', py: 1 }}>TOTAL RECEIVED</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#047857', borderBottom: '1px solid #e5e7eb', py: 1 }}>{formatCurrency(totalAmount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>Customer Advance / Credit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>{formatCurrency(unallocated)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Footer */}
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.8rem', borderTop: '1px solid #e5e7eb', pt: 1 }}>
        This is an official computer-generated receipt. Thank you for your business.
      </Typography>
    </Box>
  );
};

export default ReceiptPrintView;
