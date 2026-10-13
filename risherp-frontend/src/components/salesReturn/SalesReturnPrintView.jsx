import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, useTheme, alpha } from '@mui/material';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

const SalesReturnPrintView = ({ ret }) => {
  if (!ret) return null;
  const theme = useTheme();

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
        color: theme.palette.text.primary,
        '@media print': { p: 0, m: 0, maxWidth: '100% !important', width: '100% !important' },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{companyName}</Typography>
          <Typography variant="subtitle2" sx={{ color: '#ea580c', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, fontSize: '0.9rem' }}>
            SALES RETURN / CREDIT NOTE
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
            Email: {companyEmail} &nbsp; Mobile: {companyMobile}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ea580c', mb: 1 }}>{ret.returnNumber}</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5, fontSize: '0.85rem' }}>
            Return Date: {ret.returnDate || '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5, fontSize: '0.85rem' }}>
            Against Invoice: {ret.invoiceNumber || '—'}
          </Typography>
        </Box>
      </Box>

      {/* Customer Block */}
      <Box sx={{ bgcolor: theme.palette.background.default, p: 1.5, mb: 3, mt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5, fontSize: '0.8rem' }}>Customer / Bill To Details</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>{ret.partyName}</Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5, fontSize: '0.85rem' }}>Mobile: {ret.partyMobile}</Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5, fontSize: '0.85rem' }}>Email: {ret.partyEmail}</Typography>
        {(ret.partyAddress || ret.partyCity) && (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '0.85rem' }}>
            Address: {[ret.partyAddress, ret.partyCity, ret.partyState].filter(Boolean).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Items Table */}
      <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', mb: 2 }}>
        <Table sx={{ minWidth: 550, border: `1px solid ${theme.palette.divider}` }} size="small">
          <TableHead sx={{ bgcolor: theme.palette.background.default }}>
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
                <TableCell sx={{ color: theme.palette.text.primary, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>{idx + 1}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  {item.itemNameSnapshot}
                  {item.itemCodeSnapshot && <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{item.itemCodeSnapshot}</div>}
                </TableCell>
                <TableCell align="center" sx={{ color: theme.palette.text.primary, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  {formatQuantity(item.originalQuantity)} {item.unitSnapshot}
                </TableCell>
                <TableCell align="center" sx={{ color: theme.palette.text.primary, fontWeight: 700, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  {formatQuantity(item.returnQuantity)} {item.unitSnapshot}
                </TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>{formatCurrency(item.rate)}</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, fontWeight: 700, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>{formatCurrency(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bottom Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <Box sx={{ width: { xs: '100%', sm: '50%' }, pt: 1 }}>
          {ret.refundMode && (
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5, fontSize: '0.85rem' }}>
              Adjustment / Refund Mode: {ret.refundMode.replace('_', ' ')}
            </Typography>
          )}
          {ret.reason && (
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '0.85rem' }}>
              Reason: {ret.reason}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Table sx={{ border: `1px solid ${theme.palette.divider}` }} size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}`, py: 1 }}>Subtotal</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}`, py: 1 }}>{formatCurrency(ret.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}`, py: 1 }}>Item Discount</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}`, py: 1 }}>- {formatCurrency(ret.totalDiscount)}</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 700, color: '#ea580c', borderBottom: 'none', py: 1 }}>RETURN AMOUNT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#ea580c', borderBottom: 'none', py: 1 }}>{formatCurrency(ret.returnAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Footer */}
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary, fontSize: '0.8rem', borderTop: `1px solid ${theme.palette.divider}`, pt: 1 }}>
        This is a computer-generated credit note. No signature required.
      </Typography>
    </Box>
  );
};

export default SalesReturnPrintView;
