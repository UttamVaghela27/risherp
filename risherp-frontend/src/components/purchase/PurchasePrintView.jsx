import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

const PurchasePrintView = ({ purchase }) => {
  if (!purchase) return null;

  const companyName = purchase.businessName || 'ABC Enterprise';
  const companyMobile = purchase.businessMobile || '';
  const companyEmail = purchase.businessEmail || '';

  return (
    <Box
      className="printable-purchase"
      sx={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        p: { xs: 2, sm: 4 },
        maxWidth: 800,
        mx: 'auto',
        bgcolor: 'background.paper',
        color: '#000000',
        '@media print': { p: 0, m: 0, maxWidth: '100% !important', width: '100% !important' },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{companyName}</Typography>
          <Typography variant="subtitle2" sx={{ color: '#1e3a8a', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.9rem' }}>
            PURCHASE INVOICE / VOUCHER
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            Phone: {companyMobile} | Email: {companyEmail}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>{purchase.purchaseNumber}</Typography>
          <Typography variant="body2" sx={{ color: '#000', mb: 0.25, fontSize: '0.85rem' }}>
            Date: {purchase.purchaseDate || '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#000', mb: 0.25, fontSize: '0.85rem' }}>
            Type: {purchase.purchaseType || 'CASH'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#047857', fontWeight: 700, fontSize: '0.85rem' }}>
            Payment: {purchase.paymentStatus || 'PAID'}
          </Typography>
        </Box>
      </Box>

      {/* Supplier Block */}
      <Box sx={{ bgcolor: '#f0f4f8', p: 1.5, mb: 3, mt: 1, borderTop: '1px solid #d1d5db' }}>
        <Typography variant="body2" sx={{ color: '#1e3a8a', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.75rem' }}>
          SUPPLIER / VENDOR DETAILS:
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.25, fontSize: '1.1rem' }}>{purchase.partyName}</Typography>
        <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.25, fontSize: '0.85rem' }}>
          {purchase.partyCode && `Supplier Code: ${purchase.partyCode} | `}Phone: {purchase.partyMobile} | Email: {purchase.partyEmail}
        </Typography>
        {(purchase.partyAddress || purchase.partyCity) && (
          <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.85rem' }}>
            Address: {[purchase.partyAddress, purchase.partyCity, purchase.partyState, purchase.partyPincode].filter(Boolean).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Items Table */}
      <Table sx={{ mb: 2, border: '1px solid #e5e7eb' }} size="small">
        <TableHead sx={{ bgcolor: '#f0f4f8' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>ITEM DESCRIPTION</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>QTY</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>UNIT</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>PURCHASE RATE</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>DISCOUNT</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>AMOUNT</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(purchase.items || []).map((item, idx) => (
            <TableRow key={item.id || idx}>
              <TableCell sx={{ color: '#000', py: 1.5, borderBottom: '1px solid #e5e7eb' }}>{idx + 1}</TableCell>
              <TableCell sx={{ color: '#000', py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.itemNameSnapshot}</Typography>
                {item.itemCodeSnapshot && <Typography variant="caption" sx={{ color: '#666' }}>Code: {item.itemCodeSnapshot}</Typography>}
              </TableCell>
              <TableCell align="center" sx={{ color: '#000', fontWeight: 700, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                {formatQuantity(item.quantity)}
              </TableCell>
              <TableCell align="center" sx={{ color: '#000', py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                {item.unitSnapshot}
              </TableCell>
              <TableCell align="right" sx={{ color: '#000', py: 1.5, borderBottom: '1px solid #e5e7eb' }}>{formatCurrency(item.rate)}</TableCell>
              <TableCell align="right" sx={{ color: '#000', py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                {parseFloat(item.discountAmount) > 0 ? `- ${formatCurrency(item.discountAmount)}` : '—'}
              </TableCell>
              <TableCell align="right" sx={{ color: '#000', fontWeight: 700, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>{formatCurrency(item.lineTotal)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Bottom Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ width: '50%', pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.85rem' }}>
            Payment Mode: {purchase.paymentMode || 'CASH'}
          </Typography>
        </Box>
        <Box sx={{ width: '45%' }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: '#4b5563', borderBottom: 'none', py: 0.5, px: 0 }}>Subtotal:</TableCell>
                <TableCell align="right" sx={{ color: '#000', borderBottom: 'none', py: 0.5, px: 0 }}>{formatCurrency(purchase.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: '#4b5563', borderBottom: 'none', py: 0.5, px: 0 }}>Item Discount:</TableCell>
                <TableCell align="right" sx={{ color: '#000', borderBottom: 'none', py: 0.5, px: 0 }}>- {formatCurrency(purchase.itemDiscount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: '#4b5563', borderBottom: '1px solid #e5e7eb', py: 0.5, px: 0 }}>Total Discount:</TableCell>
                <TableCell align="right" sx={{ color: '#000', borderBottom: '1px solid #e5e7eb', py: 0.5, px: 0 }}>- {formatCurrency(purchase.overallDiscount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', borderBottom: '1px solid #e5e7eb', py: 1, px: 0, fontSize: '1rem' }}>Grand Total:</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', borderBottom: '1px solid #e5e7eb', py: 1, px: 0, fontSize: '1rem' }}>{formatCurrency(purchase.grandTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: '#000', borderBottom: 'none', py: 1, px: 0 }}>Paid Amount:</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#047857', borderBottom: 'none', py: 1, px: 0 }}>{formatCurrency(purchase.paidAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: '#000', borderBottom: 'none', py: 0.5, px: 0 }}>Balance Payable:</TableCell>
                <TableCell align="right" sx={{ color: '#6b7280', borderBottom: 'none', py: 0.5, px: 0 }}>{formatCurrency(purchase.balanceAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default PurchasePrintView;
