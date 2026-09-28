import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Typography, Paper,
  useTheme,
  alpha
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SalesCartRow from './SalesCartRow';

/**
 * SalesCart — full cart table wrapping all SalesCartRow items.
 */
const SalesCart = ({ items, onUpdateItem, onRemoveItem }) => {
  const theme = useTheme();
  if (!items || items.length === 0) {
    return (
      <Box
        sx={{
          border: '2px dashed #cbd5e1',
          borderRadius: '14px',
          py: 5,
          px: 3,
          textAlign: 'center',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          boxShadow: '0 2px 8px rgba(37,99,235,0.15)'
        }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 26 }} />
        </Box>
        <Typography color={theme.palette.text.primary} fontWeight={700} variant="body1">
          Billing Cart is Empty
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 360, mt: 0.5, fontSize: '0.8rem' }}>
          Search an item by name/code above or scan a barcode to add it to this sale invoice.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: '12px', border: 1, borderColor: 'divider', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ width: 36, fontWeight: 700, fontSize: 11, color: theme.palette.text.secondary, letterSpacing: '0.05em', bgcolor: 'background.default' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: theme.palette.text.secondary, letterSpacing: '0.05em', bgcolor: 'background.default' }}>ITEM DESCRIPTION</TableCell>
              <TableCell sx={{ width: 120, fontWeight: 700, fontSize: 11, color: theme.palette.text.secondary, letterSpacing: '0.05em', bgcolor: 'background.default' }}>QTY</TableCell>
              <TableCell sx={{ width: 110, fontWeight: 700, fontSize: 11, color: theme.palette.text.secondary, letterSpacing: '0.05em', bgcolor: 'background.default' }}>RATE (₹)</TableCell>
              <TableCell sx={{ width: 180, fontWeight: 700, fontSize: 11, color: theme.palette.text.secondary, letterSpacing: '0.05em', bgcolor: 'background.default' }}>DISCOUNT</TableCell>
              <TableCell sx={{ width: 120, textAlign: 'right', fontWeight: 700, fontSize: 11, color: theme.palette.text.secondary, letterSpacing: '0.05em', bgcolor: 'background.default' }}>
                LINE TOTAL
              </TableCell>
              <TableCell sx={{ width: 44, bgcolor: 'background.default' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <SalesCartRow
                key={item.cartId}
                item={item}
                index={index}
                onUpdate={onUpdateItem}
                onRemove={onRemoveItem}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SalesCart;
