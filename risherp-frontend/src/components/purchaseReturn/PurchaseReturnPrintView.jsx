import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

const PurchaseReturnPrintView = ({ ret }) => {
  if (!ret) return null;

  const companyName = ret.businessName || 'ABC Enterprise';
  const companyMobile = ret.businessMobile || '';
  const companyEmail = ret.businessEmail || '';

  return (
    <Box
      className="printable-return"
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
          <Typography variant="subtitle2" sx={{ color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.9rem' }}>
            PURCHASE RETURN / DEBIT NOTE
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            Email: {companyEmail} &nbsp; Mobile: {companyMobile}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626', mb: 1 }}>{ret.returnNumber}</Typography>
          <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>
            Return Date: {ret.returnDate || '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>
            Against Purchase: {ret.purchaseNumber || '—'}
          </Typography>
        </Box>
      </Box>

      {/* Supplier Block */}
      <Box sx={{ bgcolor: '#f0f4f8', p: 1.5, mb: 3, mt: 1, borderTop: '1px solid #d1d5db' }}>
        <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.5, fontSize: '0.8rem' }}>Supplier / Vendor Details</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{ret.partyName}</Typography>
        <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>Mobile: {ret.partyMobile}</Typography>
        <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>Email: {ret.partyEmail}</Typography>
        {(ret.partyAddress || ret.partyCity) && (
          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem' }}>
            Address: {[ret.partyAddress, ret.partyCity, ret.partyState].filter(Boolean).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Items Table */}
      <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', mb: 2 }}>
        <Table sx={{ minWidth: 550, border: '1px solid #e5e7eb' }} size="small">
          <TableHead sx={{ bgcolor: '#f0f4f8' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>Item</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>Orig. Qty</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>Return Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>Rate</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a', py: 1 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(ret.items || []).map((item, idx) => (
              <TableRow key={item.id || idx}>
                <TableCell sx={{ color: '#000', py: 1, borderBottom: '1px solid #e5e7eb' }}>{idx + 1}</TableCell>
                <TableCell sx={{ color: '#000', py: 1, borderBottom: '1px solid #e5e7eb' }}>
                  {item.itemNameSnapshot}
                  {item.itemCodeSnapshot && <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.itemCodeSnapshot}</div>}
                </TableCell>
                <TableCell align="center" sx={{ color: '#000', py: 1, borderBottom: '1px solid #e5e7eb' }}>
                  {formatQuantity(item.originalQuantity)} {item.unitSnapshot}
                </TableCell>
                <TableCell align="center" sx={{ color: '#000', fontWeight: 700, py: 1, borderBottom: '1px solid #e5e7eb' }}>
                  {formatQuantity(item.returnQuantity)} {item.unitSnapshot}
                </TableCell>
                <TableCell align="right" sx={{ color: '#000', py: 1, borderBottom: '1px solid #e5e7eb' }}>{formatCurrency(item.rate)}</TableCell>
                <TableCell align="right" sx={{ color: '#000', fontWeight: 700, py: 1, borderBottom: '1px solid #e5e7eb' }}>{formatCurrency(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bottom Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <Box sx={{ width: { xs: '100%', sm: '50%' }, pt: 1 }}>
          {ret.refundMode && (
            <Typography variant="body2" sx={{ color: '#000', mb: 0.5, fontSize: '0.85rem' }}>
              Adjustment / Refund Mode: {ret.refundMode.replace('_', ' ')}
            </Typography>
          )}
          {ret.reason && (
            <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem' }}>
              Reason: {ret.reason}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Table sx={{ border: '1px solid #e5e7eb' }} size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>Subtotal</TableCell>
                <TableCell align="right" sx={{ color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>{formatCurrency(ret.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>Item Discount</TableCell>
                <TableCell align="right" sx={{ color: '#000', borderBottom: '1px solid #e5e7eb', py: 1 }}>- {formatCurrency(ret.totalDiscount)}</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: '#fef2f2' }}>
                <TableCell sx={{ fontWeight: 700, color: '#dc2626', borderBottom: 'none', py: 1 }}>RETURN AMOUNT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#dc2626', borderBottom: 'none', py: 1 }}>{formatCurrency(ret.returnAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Footer */}
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.8rem', borderTop: '1px solid #e5e7eb', pt: 1 }}>
        This is a computer-generated debit note. No signature required.
      </Typography>
    </Box>
  );
};

export default PurchaseReturnPrintView;
